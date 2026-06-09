-- ============================================================================
--  EcoClean Connect — Máquina de estados de `requests`
--  Valida transiciones permitidas y registra el historial automáticamente.
--  (Refuerzo a nivel BD; la API también valida en RequestsModule.)
-- ============================================================================

-- Transiciones permitidas:
--   pendiente   -> asignado | cancelado
--   asignado    -> en_ruta | cancelado
--   en_ruta     -> recolectado | cancelado
--   recolectado -> en_deposito
--   en_deposito -> cerrado
--   cerrado / cancelado -> (terminal)
create or replace function public.enforce_request_transition()
returns trigger language plpgsql as $$
declare ok boolean;
begin
  if new.status = old.status then
    return new;
  end if;
  ok := case old.status
    when 'pendiente'   then new.status in ('asignado','cancelado')
    when 'asignado'    then new.status in ('en_ruta','cancelado')
    when 'en_ruta'     then new.status in ('recolectado','cancelado')
    when 'recolectado' then new.status in ('en_deposito')
    when 'en_deposito' then new.status in ('cerrado')
    else false
  end;
  if not ok then
    raise exception 'Transición de estado inválida: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;
  return new;
end; $$;

drop trigger if exists trg_requests_transition on public.requests;
create trigger trg_requests_transition
  before update of status on public.requests
  for each row execute function public.enforce_request_transition();

-- Registro automático del historial (INSERT inicial + cada cambio de estado)
create or replace function public.log_request_status()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into public.request_status_history (request_id, from_status, to_status, actor_id)
    values (new.id, null, new.status,
            (select id from public.profiles where id = auth.uid()));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.request_status_history (request_id, from_status, to_status, actor_id)
    values (new.id, old.status, new.status,
            (select id from public.profiles where id = auth.uid()));
  end if;
  return null;
end; $$;

drop trigger if exists trg_requests_log_status on public.requests;
create trigger trg_requests_log_status
  after insert or update of status on public.requests
  for each row execute function public.log_request_status();
