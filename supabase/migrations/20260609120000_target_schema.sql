-- ============================================================================
--  EcoClean Connect — Esquema objetivo (tablas + RLS)
--  Migración: modelo normalizado multi-rol con PostGIS, RBAC, auditoría y
--  cumplimiento Ley 1581. Reemplaza conceptualmente la tabla `reports`.
--  Diseño: ~/.claude/plans/lively-munching-cake.md
--
--  Convenciones Supabase:
--   • auth.uid() -> uuid del usuario autenticado (claim JWT).
--   • El rol `service_role` (solo BACKEND) tiene BYPASSRLS: por eso NO se
--     definen políticas de INSERT/UPDATE/DELETE para `authenticated` en las
--     tablas de negocio — todas las escrituras pasan por la API.
-- ============================================================================

-- ── 0. EXTENSIONES ──────────────────────────────────────────────────────────
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- ── 1. TIPOS ENUM ─────────────────────────────────────────────────────────--
do $$ begin create type user_role as enum
  ('ciudadano','conductor','admin_alcaldia','operador_empresa','super_admin');
exception when duplicate_object then null; end $$;

do $$ begin create type request_status as enum
  ('pendiente','asignado','en_ruta','recolectado','en_deposito','cerrado','cancelado');
exception when duplicate_object then null; end $$;

do $$ begin create type image_kind as enum
  ('residuo','evidencia_recogida','evidencia_entrega');
exception when duplicate_object then null; end $$;

do $$ begin create type truck_status as enum
  ('disponible','en_ruta','mantenimiento','inactivo');
exception when duplicate_object then null; end $$;

do $$ begin create type driver_status as enum ('disponible','en_ruta','inactivo');
exception when duplicate_object then null; end $$;

do $$ begin create type route_status as enum
  ('planificada','en_curso','completada','cancelada');
exception when duplicate_object then null; end $$;

do $$ begin create type notification_channel as enum ('email');
exception when duplicate_object then null; end $$;

do $$ begin create type notification_status as enum ('pending','sent','failed');
exception when duplicate_object then null; end $$;

do $$ begin create type time_window as enum ('am','pm','late');
exception when duplicate_object then null; end $$;

do $$ begin create type consent_purpose as enum
  ('servicio','ubicacion_gps','fotos','comunicaciones');
exception when duplicate_object then null; end $$;

do $$ begin create type dsar_type as enum
  ('acceso','rectificacion','supresion','revocacion','oposicion');
exception when duplicate_object then null; end $$;

do $$ begin create type dsar_status as enum
  ('recibido','en_tramite','resuelto','rechazado');
exception when duplicate_object then null; end $$;

-- ── 2. FUNCIONES UTILITARIAS Y DE SEGURIDAD ─────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.prevent_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Tabla append-only: operación % no permitida en %', tg_op, tg_table_name;
end; $$;

-- NOTA: current_app_role() e is_staff() se definen DESPUÉS de crear la tabla
-- profiles (sección 4), porque son funciones LANGUAGE sql y Postgres valida su
-- cuerpo contra public.profiles al momento de crearlas (check_function_bodies).

create sequence if not exists public.request_code_seq;
create or replace function public.set_request_code()
returns trigger language plpgsql as $$
begin
  if new.code is null then
    new.code := 'R-' || to_char(now(),'YYYY') || '-' ||
                lpad(nextval('public.request_code_seq')::text, 6, '0');
  end if;
  return new;
end; $$;

-- ── 3. TABLAS GEOGRÁFICAS (PostGIS) ─────────────────────────────────────────
create table if not exists public.service_areas (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  area       geometry(MultiPolygon, 4326) not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.municipalities (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  service_area_id uuid references public.service_areas(id) on delete set null,
  centroid        geometry(Point, 4326) not null,
  boundary        geometry(MultiPolygon, 4326),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ── 4. IDENTIDAD Y RBAC ─────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role not null default 'ciudadano',
  full_name       text not null default '',
  email           text not null,
  phone           text,
  municipality_id uuid references public.municipalities(id) on delete set null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Funciones de seguridad (dependen de profiles). SECURITY DEFINER para leer
-- profiles sin disparar RLS y evitar recursión en las políticas.
create or replace function public.current_app_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('admin_alcaldia','operador_empresa','super_admin')
       from public.profiles where id = auth.uid()), false);
$$;

create table if not exists public.permissions (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  description text not null default ''
);
create table if not exists public.role_permissions (
  role          user_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role, permission_id)
);

-- ── 5. OPERACIÓN: CAMIONES Y CONDUCTORES ────────────────────────────────────
create table if not exists public.trucks (
  id               uuid primary key default gen_random_uuid(),
  plate            text unique not null,
  capacity_kg      integer not null check (capacity_kg > 0),
  used_kg          integer not null default 0 check (used_kg >= 0),
  status           truck_status not null default 'disponible',
  current_location geometry(Point, 4326),
  driver_id        uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_trucks_updated_at before update on public.trucks
  for each row execute function public.set_updated_at();

create table if not exists public.driver_profiles (
  profile_id     uuid primary key references public.profiles(id) on delete cascade,
  license_number text not null,
  truck_id       uuid references public.trucks(id) on delete set null,
  status         driver_status not null default 'disponible',
  last_location  geometry(Point, 4326),
  last_seen_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_driver_profiles_updated_at before update on public.driver_profiles
  for each row execute function public.set_updated_at();

-- ── 6. CATÁLOGO Y TARIFAS ───────────────────────────────────────────────────
create table if not exists public.waste_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text unique not null,
  display_order integer not null default 0,
  active        boolean not null default true
);

create table if not exists public.waste_types (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.waste_categories(id) on delete restrict,
  slug        text unique not null,
  label       text not null,
  icon        text,
  peso_min    integer not null check (peso_min >= 0),
  peso_max    integer not null check (peso_max >= peso_min),
  vol_min     numeric(6,3) not null default 0,
  vol_max     numeric(6,3) not null default 0,
  base_min    integer not null check (base_min >= 0),
  base_max    integer not null check (base_max >= base_min),
  active      boolean not null default true
);

create table if not exists public.strata (
  id             uuid primary key default gen_random_uuid(),
  stratum        smallint not null check (stratum between 1 and 6),
  label          text not null,
  subsidy_pct    smallint not null check (subsidy_pct between 0 and 100),
  effective_from timestamptz not null default now(),
  effective_to   timestamptz,
  created_at     timestamptz not null default now()
);
create unique index if not exists uq_strata_current
  on public.strata(stratum) where effective_to is null;

-- ── 7. SOLICITUDES (núcleo) ─────────────────────────────────────────────────
create table if not exists public.requests (
  id                 uuid primary key default gen_random_uuid(),
  code               text unique,
  citizen_id         uuid not null references public.profiles(id) on delete restrict,
  waste_type_id      uuid not null references public.waste_types(id) on delete restrict,
  peso               integer not null check (peso >= 0),
  municipality_id    uuid not null references public.municipalities(id) on delete restrict,
  address            text not null default '',
  location           geometry(Point, 4326) not null,
  scheduled_date     date not null,
  scheduled_window   time_window not null,
  status             request_status not null default 'pendiente',
  stratum            smallint not null check (stratum between 1 and 6),
  subsidy_pct        smallint not null check (subsidy_pct between 0 and 100),
  tarifa_base        integer not null check (tarifa_base >= 0),
  costo_final        integer not null check (costo_final >= 0),
  assigned_driver_id uuid references public.profiles(id) on delete set null,
  assigned_truck_id  uuid references public.trucks(id) on delete set null,
  needs_review       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger trg_requests_code before insert on public.requests
  for each row execute function public.set_request_code();
create trigger trg_requests_updated_at before update on public.requests
  for each row execute function public.set_updated_at();

create table if not exists public.request_status_history (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.requests(id) on delete cascade,
  from_status request_status,
  to_status   request_status not null,
  actor_id    uuid references public.profiles(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.request_images (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.requests(id) on delete cascade,
  kind         image_kind not null,
  storage_path text not null,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists public.ai_analyses (
  id               uuid primary key default gen_random_uuid(),
  request_image_id uuid not null references public.request_images(id) on delete cascade,
  detected_type_id uuid references public.waste_types(id) on delete set null,
  confidence       numeric(4,3) check (confidence between 0 and 1),
  matches_selected boolean,
  model            text,
  raw              jsonb,
  created_at       timestamptz not null default now()
);

-- ── 8. RUTAS ────────────────────────────────────────────────────────────────
create table if not exists public.routes (
  id               uuid primary key default gen_random_uuid(),
  driver_id        uuid not null references public.profiles(id) on delete restrict,
  route_date       date not null,
  status           route_status not null default 'planificada',
  geometry         geometry(LineString, 4326),
  total_distance_m integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger trg_routes_updated_at before update on public.routes
  for each row execute function public.set_updated_at();

create table if not exists public.route_stops (
  id           uuid primary key default gen_random_uuid(),
  route_id     uuid not null references public.routes(id) on delete cascade,
  request_id   uuid not null references public.requests(id) on delete restrict,
  seq          integer not null,
  eta          timestamptz,
  arrived_at   timestamptz,
  completed_at timestamptz,
  unique (route_id, seq)
);

-- ── 9. NOTIFICACIONES (outbox) ──────────────────────────────────────────────
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  channel      notification_channel not null default 'email',
  template     text not null,
  payload      jsonb not null default '{}'::jsonb,
  status       notification_status not null default 'pending',
  attempts     integer not null default 0,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- ── 10. AUDITORÍA (append-only) ─────────────────────────────────────────────
create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid,
  action     text not null,
  entity     text not null,
  entity_id  text,
  before     jsonb,
  after      jsonb,
  ip         inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create trigger trg_audit_log_immutable before update or delete on public.audit_log
  for each row execute function public.prevent_mutation();

-- ── 11. CUMPLIMIENTO LEY 1581 / DECRETO 1377 ────────────────────────────────
create table if not exists public.privacy_policy_versions (
  id             uuid primary key default gen_random_uuid(),
  version        text unique not null,
  body           text not null,
  effective_from timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

create table if not exists public.consents (
  id                uuid primary key default gen_random_uuid(),
  subject_id        uuid not null references public.profiles(id) on delete cascade,
  policy_version_id uuid not null references public.privacy_policy_versions(id),
  purpose           consent_purpose not null,
  granted           boolean not null,
  channel           text not null default 'web',
  ip                inet,
  user_agent        text,
  granted_at        timestamptz not null default now(),
  revoked_at        timestamptz
);
create index if not exists idx_consents_subject on public.consents(subject_id);

create table if not exists public.data_subject_requests (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.profiles(id) on delete cascade,
  type        dsar_type not null,
  status      dsar_status not null default 'recibido',
  received_at timestamptz not null default now(),
  due_at      timestamptz,
  resolved_at timestamptz,
  notes       text
);

-- ── 12. CACHÉ DE GEOCODIFICACIÓN (uso interno del backend) ──────────────────
create table if not exists public.geocode_cache (
  id         uuid primary key default gen_random_uuid(),
  query_hash text unique not null,
  result     jsonb not null,
  provider   text not null,
  created_at timestamptz not null default now()
);

-- ── 13. ÍNDICES ─────────────────────────────────────────────────────────────
create index if not exists gix_service_areas_area      on public.service_areas using gist (area);
create index if not exists gix_municipalities_centroid on public.municipalities using gist (centroid);
create index if not exists gix_municipalities_boundary on public.municipalities using gist (boundary);
create index if not exists gix_requests_location       on public.requests using gist (location);
create index if not exists gix_trucks_location         on public.trucks using gist (current_location);
create index if not exists gix_driver_last_location    on public.driver_profiles using gist (last_location);
create index if not exists gix_routes_geometry         on public.routes using gist (geometry);

create index if not exists idx_requests_citizen   on public.requests(citizen_id);
create index if not exists idx_requests_driver    on public.requests(assigned_driver_id);
create index if not exists idx_requests_status    on public.requests(status);
create index if not exists idx_requests_muni_date on public.requests(municipality_id, scheduled_date);
create index if not exists idx_status_hist_req    on public.request_status_history(request_id);
create index if not exists idx_req_images_req     on public.request_images(request_id);
create index if not exists idx_route_stops_route  on public.route_stops(route_id);
create index if not exists idx_notifications_pending
  on public.notifications(status) where status = 'pending';
create index if not exists idx_dsar_status on public.data_subject_requests(status);

-- ============================================================================
--  14. ROW LEVEL SECURITY
--  Solo políticas de SELECT para `authenticated`. Escrituras => service_role.
-- ============================================================================
alter table public.service_areas          enable row level security;
alter table public.municipalities         enable row level security;
alter table public.profiles               enable row level security;
alter table public.permissions            enable row level security;
alter table public.role_permissions       enable row level security;
alter table public.trucks                 enable row level security;
alter table public.driver_profiles        enable row level security;
alter table public.waste_categories       enable row level security;
alter table public.waste_types            enable row level security;
alter table public.strata                 enable row level security;
alter table public.requests               enable row level security;
alter table public.request_status_history enable row level security;
alter table public.request_images         enable row level security;
alter table public.ai_analyses            enable row level security;
alter table public.routes                 enable row level security;
alter table public.route_stops            enable row level security;
alter table public.notifications          enable row level security;
alter table public.audit_log              enable row level security;
alter table public.privacy_policy_versions enable row level security;
alter table public.consents               enable row level security;
alter table public.data_subject_requests  enable row level security;
alter table public.geocode_cache          enable row level security;

-- Catálogo y geografía: lectura para cualquier autenticado
drop policy if exists sel_service_areas on public.service_areas;
create policy sel_service_areas  on public.service_areas  for select to authenticated using (true);
drop policy if exists sel_municipalities on public.municipalities;
create policy sel_municipalities on public.municipalities for select to authenticated using (true);
drop policy if exists sel_waste_cats on public.waste_categories;
create policy sel_waste_cats     on public.waste_categories for select to authenticated using (true);
drop policy if exists sel_waste_types on public.waste_types;
create policy sel_waste_types    on public.waste_types    for select to authenticated using (true);
drop policy if exists sel_strata on public.strata;
create policy sel_strata         on public.strata         for select to authenticated using (true);
drop policy if exists sel_trucks on public.trucks;
create policy sel_trucks         on public.trucks         for select to authenticated using (true);

-- Aviso/política de privacidad: público
drop policy if exists sel_privacy_policy on public.privacy_policy_versions;
create policy sel_privacy_policy on public.privacy_policy_versions
  for select to anon, authenticated using (true);

-- profiles: el propio o staff
drop policy if exists sel_profiles on public.profiles;
create policy sel_profiles on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_staff());

-- RBAC: solo staff
drop policy if exists sel_permissions on public.permissions;
create policy sel_permissions on public.permissions
  for select to authenticated using (public.is_staff());
drop policy if exists sel_role_perms on public.role_permissions;
create policy sel_role_perms on public.role_permissions
  for select to authenticated using (public.is_staff());

-- driver_profiles: el propio o staff
drop policy if exists sel_driver_profiles on public.driver_profiles;
create policy sel_driver_profiles on public.driver_profiles
  for select to authenticated using (profile_id = auth.uid() or public.is_staff());

-- requests: dueño | conductor asignado | staff
drop policy if exists sel_requests on public.requests;
create policy sel_requests on public.requests
  for select to authenticated using (
    citizen_id = auth.uid() or assigned_driver_id = auth.uid() or public.is_staff());

-- hijas de requests (visibilidad heredada)
drop policy if exists sel_status_hist on public.request_status_history;
create policy sel_status_hist on public.request_status_history
  for select to authenticated using (
    exists (select 1 from public.requests r where r.id = request_id
            and (r.citizen_id = auth.uid() or r.assigned_driver_id = auth.uid() or public.is_staff())));

drop policy if exists sel_req_images on public.request_images;
create policy sel_req_images on public.request_images
  for select to authenticated using (
    exists (select 1 from public.requests r where r.id = request_id
            and (r.citizen_id = auth.uid() or r.assigned_driver_id = auth.uid() or public.is_staff())));

drop policy if exists sel_ai_analyses on public.ai_analyses;
create policy sel_ai_analyses on public.ai_analyses
  for select to authenticated using (
    exists (select 1 from public.request_images i
            join public.requests r on r.id = i.request_id
            where i.id = request_image_id
            and (r.citizen_id = auth.uid() or r.assigned_driver_id = auth.uid() or public.is_staff())));

-- routes / route_stops
drop policy if exists sel_routes on public.routes;
create policy sel_routes on public.routes
  for select to authenticated using (driver_id = auth.uid() or public.is_staff());
drop policy if exists sel_route_stops on public.route_stops;
create policy sel_route_stops on public.route_stops
  for select to authenticated using (
    exists (select 1 from public.routes rt where rt.id = route_id
            and (rt.driver_id = auth.uid() or public.is_staff())));

-- notifications: destinatario | staff
drop policy if exists sel_notifications on public.notifications;
create policy sel_notifications on public.notifications
  for select to authenticated using (recipient_id = auth.uid() or public.is_staff());

-- audit_log: solo staff lee (insert solo service_role; update/delete bloqueado por trigger)
drop policy if exists sel_audit on public.audit_log;
create policy sel_audit on public.audit_log
  for select to authenticated using (public.is_staff());

-- consents / DSAR: el titular o staff
drop policy if exists sel_consents on public.consents;
create policy sel_consents on public.consents
  for select to authenticated using (subject_id = auth.uid() or public.is_staff());
drop policy if exists sel_dsar on public.data_subject_requests;
create policy sel_dsar on public.data_subject_requests
  for select to authenticated using (subject_id = auth.uid() or public.is_staff());

-- geocode_cache: sin políticas => cerrado a anon/authenticated (solo service_role).
