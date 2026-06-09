-- ============================================================================
--  EcoClean Connect — Storage: bucket privado de imágenes + políticas
--  (Específico de Supabase: usa el schema `storage`. No aplica en Postgres
--   plano; se valida solo dentro de Supabase.)
--
--  Modelo de acceso: el bucket es PRIVADO. La subida y descarga se hacen con
--  SIGNED URLs emitidas por el BACKEND (service_role). Convención de ruta:
--     request-images/{request_id}/{kind}/{uuid}.{ext}
--  Las políticas siguientes permiten, además, lectura directa a staff y al
--  dueño de la solicitud (defensa en profundidad).
-- ============================================================================

-- Bucket privado
insert into storage.buckets (id, name, public)
values ('request-images', 'request-images', false)
on conflict (id) do nothing;

-- Lectura: staff o dueño de la solicitud (el request_id es el 1er segmento)
drop policy if exists "request_images_read" on storage.objects;
create policy "request_images_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'request-images'
    and (
      public.is_staff()
      or exists (
        select 1 from public.requests r
        where r.id = (split_part(name, '/', 1))::uuid
          and (r.citizen_id = auth.uid() or r.assigned_driver_id = auth.uid())
      )
    )
  );

-- Escritura directa por clientes: DENEGADA (sin política de insert/update/delete
-- para authenticated). Las subidas se hacen con signed URLs del backend
-- (service_role), que omite RLS.
