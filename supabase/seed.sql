-- ============================================================================
--  EcoClean Connect — Semillas
--  Portadas desde src/data.js: área de servicio, municipios, categorías y tipos
--  de residuo, estratos/subsidios y camiones. Idempotente (ON CONFLICT).
--  NOTA: las geometrías PostGIS usan orden (lng lat).
-- ============================================================================

-- ── Área de servicio (Valle de Aburrá) — desde VALLE_POLYGON ────────────────
insert into public.service_areas (name, area)
select 'Área Metropolitana del Valle de Aburrá',
  st_geomfromtext(
    'MULTIPOLYGON(((' ||
    '-75.300 6.470, -75.405 6.405, -75.480 6.345, -75.525 6.260, ' ||
    '-75.545 6.165, -75.595 6.095, -75.645 6.060, -75.670 6.110, ' ||
    '-75.655 6.200, -75.595 6.310, -75.495 6.390, -75.395 6.450, ' ||
    '-75.300 6.470)))', 4326)
where not exists (select 1 from public.service_areas
                  where name = 'Área Metropolitana del Valle de Aburrá');

-- ── Municipios — desde MUNICIPIOS ───────────────────────────────────────────
insert into public.municipalities (name, service_area_id, centroid)
select m.name,
       (select id from public.service_areas
        where name = 'Área Metropolitana del Valle de Aburrá'),
       st_setsrid(st_makepoint(m.lng, m.lat), 4326)
from (values
  ('Medellín',    6.2442, -75.5812),
  ('Bello',       6.3373, -75.5558),
  ('Itagüí',      6.1719, -75.6112),
  ('Envigado',    6.1699, -75.5827),
  ('Sabaneta',    6.1515, -75.6166),
  ('La Estrella', 6.1574, -75.6434),
  ('Caldas',      6.0918, -75.6364),
  ('Copacabana',  6.3485, -75.5090),
  ('Girardota',   6.3792, -75.4456),
  ('Barbosa',     6.4393, -75.3317)
) as m(name, lat, lng)
where not exists (select 1 from public.municipalities mm where mm.name = m.name);

-- ── Categorías — desde WASTE_CATEGORIES ─────────────────────────────────────
insert into public.waste_categories (name, display_order) values
  ('Muebles', 1),
  ('Camas y descanso', 2),
  ('Electrodomésticos', 3),
  ('Construcción y baño', 4),
  ('Otros', 5)
on conflict (name) do nothing;

-- ── Tipos de residuo — desde WASTE_CATALOG ──────────────────────────────────
insert into public.waste_types
  (category_id, slug, label, icon, peso_min, peso_max, vol_min, vol_max, base_min, base_max)
select (select id from public.waste_categories where name = t.cat),
       t.slug, t.label, t.icon, t.peso_min, t.peso_max, t.vol_min, t.vol_max, t.base_min, t.base_max
from (values
  ('Muebles','sofa','Sofá','🛋️',40,70,0.8,2.2,60000,160000),
  ('Muebles','armario','Armario','🚪',50,90,0.4,2.5,50000,180000),
  ('Muebles','sillas','Sillas (juego)','🪑',4,7,0.08,0.25,150000,350000),
  ('Muebles','estanteria','Estantería','🗄️',20,50,0.15,0.8,30000,90000),
  ('Muebles','comoda','Cómoda','🧳',20,50,0.2,0.6,40000,95000),
  ('Muebles','tocador','Tocador','🪞',20,50,0.3,0.9,45000,110000),
  ('Camas y descanso','camas','Camas','🛏️',25,50,0.3,1.8,45000,140000),
  ('Camas y descanso','colchones','Colchones','🛌',25,50,0.3,1.2,40000,70000),
  ('Camas y descanso','basecama','Base de cama','🛏️',25,50,0.25,1.2,35000,95000),
  ('Camas y descanso','somieres','Somieres','🛏️',25,50,0.1,0.5,25000,65000),
  ('Electrodomésticos','neveras','Neveras','❄️',60,90,0.2,1.5,40000,150000),
  ('Electrodomésticos','lavadora','Lavadora','🧺',60,90,0.25,0.55,45000,90000),
  ('Electrodomésticos','estufas','Estufas','🍳',25,45,0.1,0.45,30000,80000),
  ('Electrodomésticos','televisores','Televisores','📺',5,25,0.03,0.35,20000,65000),
  ('Electrodomésticos','sonido','Equipo de sonido','🔊',5,25,0.02,0.25,20000,70000),
  ('Construcción y baño','construccion','Mat. construcción','🧱',10,25,0.02,0.05,0,55000),
  ('Construcción y baño','puertas','Puertas','🚪',10,25,0.04,0.12,30000,85000),
  ('Construcción y baño','ventanas','Ventanas','🪟',10,25,0.03,0.2,20000,60000),
  ('Construcción y baño','inodoros','Inodoros','🚽',10,35,0.1,0.25,30000,65000),
  ('Construcción y baño','lavamanos','Lavamanos','🚰',10,35,0.05,0.22,20000,55000),
  ('Otros','alfombras','Alfombras','🟫',5,18,0.02,0.15,20000,55000),
  ('Otros','bicicletas','Bicicletas','🚲',5,18,0.3,1.1,30000,65000),
  ('Otros','coches','Coches de bebé','🍼',5,18,0.08,0.3,20000,50000)
) as t(cat,slug,label,icon,peso_min,peso_max,vol_min,vol_max,base_min,base_max)
on conflict (slug) do nothing;

-- ── Estratos y subsidios — desde STRATA ─────────────────────────────────────
insert into public.strata (stratum, label, subsidy_pct)
select s.stratum, s.label, s.subsidy_pct
from (values
  (1, 'Estrato 1', 70),
  (2, 'Estrato 2', 40),
  (3, 'Estrato 3', 15),
  (4, 'Estrato 4', 0),
  (5, 'Estrato 5', 0),
  (6, 'Estrato 6', 0)
) as s(stratum, label, subsidy_pct)
where not exists (
  select 1 from public.strata x where x.stratum = s.stratum and x.effective_to is null);

-- ── Camiones — desde TRUCKS (driver_id se asigna luego, vía perfiles) ───────
insert into public.trucks (plate, capacity_kg, used_kg, status, current_location)
select t.plate, t.capacity_kg, t.used_kg, t.status::truck_status,
       st_setsrid(st_makepoint(t.lng, t.lat), 4326)
from (values
  ('AMV-123', 5000, 1200, 'disponible', 6.2442, -75.5812),
  ('AMV-456', 8000, 6500, 'en_ruta',    6.3373, -75.5558),
  ('AMV-789', 6000, 0,    'disponible', 6.1719, -75.6112)
) as t(plate, capacity_kg, used_kg, status, lat, lng)
on conflict (plate) do nothing;

-- ── Política de privacidad inicial (Ley 1581) ───────────────────────────────
insert into public.privacy_policy_versions (version, body)
select 'v1.0', 'Aviso de privacidad y política de tratamiento de datos — borrador inicial.'
where not exists (select 1 from public.privacy_policy_versions where version = 'v1.0');
