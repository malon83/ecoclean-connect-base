
/*
# Create reports table for EcoClean Connect

## Purpose
Persists waste collection reports submitted by citizens so data survives
page refreshes and is shared across all app modules (Citizen, Map, Driver, Admin).

## New Tables

### `reports`
Stores each waste collection request.

| Column        | Type        | Description                                              |
|---------------|-------------|----------------------------------------------------------|
| id            | text        | Human-readable report ID (e.g. "R001"), primary key     |
| ciudadano     | text        | Citizen's full name                                      |
| email         | text        | Citizen's email                                          |
| tipo          | text        | Waste catalog item ID (e.g. "sofa", "neveras")           |
| peso          | integer     | Declared weight in kg                                    |
| foto          | text        | Base64-encoded photo (data URL), nullable               |
| lat           | float8      | Latitude of pickup location                              |
| lng           | float8      | Longitude of pickup location                             |
| municipio     | text        | Municipality name                                        |
| direccion     | text        | Street address                                           |
| fecha         | timestamptz | Report submission timestamp                              |
| estado        | text        | Status: pendiente / asignado / recolectado / cancelado  |
| tarifa_base   | integer     | Base rate in COP before subsidy                          |
| subsidio      | integer     | Subsidy percentage applied (0–100)                       |
| costo_final   | integer     | Final amount the citizen pays in COP                     |
| estrato       | integer     | Socioeconomic stratum (1–6)                              |
| camion_id     | text        | Assigned truck ID, nullable                              |

## Security
- RLS is enabled.
- All CRUD is open to `anon` and `authenticated` roles — the app uses an
  anon-key client with no user sign-in, so data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS reports (
  id          text PRIMARY KEY,
  ciudadano   text NOT NULL,
  email       text NOT NULL DEFAULT '',
  tipo        text NOT NULL,
  peso        integer NOT NULL DEFAULT 0,
  foto        text,
  lat         float8 NOT NULL,
  lng         float8 NOT NULL,
  municipio   text NOT NULL DEFAULT '',
  direccion   text NOT NULL DEFAULT '',
  fecha       timestamptz NOT NULL DEFAULT now(),
  estado      text NOT NULL DEFAULT 'pendiente',
  tarifa_base integer NOT NULL DEFAULT 0,
  subsidio    integer NOT NULL DEFAULT 0,
  costo_final integer NOT NULL DEFAULT 0,
  estrato     integer NOT NULL DEFAULT 1,
  camion_id   text
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE
  TO anon, authenticated USING (true);
