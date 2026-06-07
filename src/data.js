// ═══════════════════════════════════════════════════════════════════════════
//  EcoClean Connect — DATOS BASE
//  Tarifas: Residuos voluminosos · Área Metropolitana del Valle de Aburrá
// ═══════════════════════════════════════════════════════════════════════════

export const WASTE_CATALOG = [
  { id: 'sofa',        label: 'Sofá',             icon: '🛋️', cat: 'Muebles',             pesoMin: 40, pesoMax: 70,  volMin: 0.8,  volMax: 2.2,  baseMin: 60000,  baseMax: 160000 },
  { id: 'armario',     label: 'Armario',          icon: '🚪', cat: 'Muebles',             pesoMin: 50, pesoMax: 90,  volMin: 0.4,  volMax: 2.5,  baseMin: 50000,  baseMax: 180000 },
  { id: 'sillas',      label: 'Sillas (juego)',   icon: '🪑', cat: 'Muebles',             pesoMin: 4,  pesoMax: 7,   volMin: 0.08, volMax: 0.25, baseMin: 150000, baseMax: 350000 },
  { id: 'estanteria',  label: 'Estantería',       icon: '🗄️', cat: 'Muebles',             pesoMin: 20, pesoMax: 50,  volMin: 0.15, volMax: 0.8,  baseMin: 30000,  baseMax: 90000 },
  { id: 'comoda',      label: 'Cómoda',           icon: '🧳', cat: 'Muebles',             pesoMin: 20, pesoMax: 50,  volMin: 0.2,  volMax: 0.6,  baseMin: 40000,  baseMax: 95000 },
  { id: 'tocador',     label: 'Tocador',          icon: '🪞', cat: 'Muebles',             pesoMin: 20, pesoMax: 50,  volMin: 0.3,  volMax: 0.9,  baseMin: 45000,  baseMax: 110000 },
  { id: 'camas',       label: 'Camas',            icon: '🛏️', cat: 'Camas y descanso',    pesoMin: 25, pesoMax: 50,  volMin: 0.3,  volMax: 1.8,  baseMin: 45000,  baseMax: 140000 },
  { id: 'colchones',   label: 'Colchones',        icon: '🛌', cat: 'Camas y descanso',    pesoMin: 25, pesoMax: 50,  volMin: 0.3,  volMax: 1.2,  baseMin: 40000,  baseMax: 70000 },
  { id: 'basecama',    label: 'Base de cama',     icon: '🛏️', cat: 'Camas y descanso',    pesoMin: 25, pesoMax: 50,  volMin: 0.25, volMax: 1.2,  baseMin: 35000,  baseMax: 95000 },
  { id: 'somieres',    label: 'Somieres',         icon: '🛏️', cat: 'Camas y descanso',    pesoMin: 25, pesoMax: 50,  volMin: 0.1,  volMax: 0.5,  baseMin: 25000,  baseMax: 65000 },
  { id: 'neveras',     label: 'Neveras',          icon: '❄️', cat: 'Electrodomésticos',   pesoMin: 60, pesoMax: 90,  volMin: 0.2,  volMax: 1.5,  baseMin: 40000,  baseMax: 150000 },
  { id: 'lavadora',    label: 'Lavadora',         icon: '🧺', cat: 'Electrodomésticos',   pesoMin: 60, pesoMax: 90,  volMin: 0.25, volMax: 0.55, baseMin: 45000,  baseMax: 90000 },
  { id: 'estufas',     label: 'Estufas',          icon: '🍳', cat: 'Electrodomésticos',   pesoMin: 25, pesoMax: 45,  volMin: 0.1,  volMax: 0.45, baseMin: 30000,  baseMax: 80000 },
  { id: 'televisores', label: 'Televisores',      icon: '📺', cat: 'Electrodomésticos',   pesoMin: 5,  pesoMax: 25,  volMin: 0.03, volMax: 0.35, baseMin: 20000,  baseMax: 65000 },
  { id: 'sonido',      label: 'Equipo de sonido', icon: '🔊', cat: 'Electrodomésticos',   pesoMin: 5,  pesoMax: 25,  volMin: 0.02, volMax: 0.25, baseMin: 20000,  baseMax: 70000 },
  { id: 'construccion',label: 'Mat. construcción',icon: '🧱', cat: 'Construcción y baño', pesoMin: 10, pesoMax: 25,  volMin: 0.02, volMax: 0.05, baseMin: 0,      baseMax: 55000 },
  { id: 'puertas',     label: 'Puertas',          icon: '🚪', cat: 'Construcción y baño', pesoMin: 10, pesoMax: 25,  volMin: 0.04, volMax: 0.12, baseMin: 30000,  baseMax: 85000 },
  { id: 'ventanas',    label: 'Ventanas',         icon: '🪟', cat: 'Construcción y baño', pesoMin: 10, pesoMax: 25,  volMin: 0.03, volMax: 0.2,  baseMin: 20000,  baseMax: 60000 },
  { id: 'inodoros',    label: 'Inodoros',         icon: '🚽', cat: 'Construcción y baño', pesoMin: 10, pesoMax: 35,  volMin: 0.1,  volMax: 0.25, baseMin: 30000,  baseMax: 65000 },
  { id: 'lavamanos',   label: 'Lavamanos',        icon: '🚰', cat: 'Construcción y baño', pesoMin: 10, pesoMax: 35,  volMin: 0.05, volMax: 0.22, baseMin: 20000,  baseMax: 55000 },
  { id: 'alfombras',   label: 'Alfombras',        icon: '🟫', cat: 'Otros',               pesoMin: 5,  pesoMax: 18,  volMin: 0.02, volMax: 0.15, baseMin: 20000,  baseMax: 55000 },
  { id: 'bicicletas',  label: 'Bicicletas',       icon: '🚲', cat: 'Otros',               pesoMin: 5,  pesoMax: 18,  volMin: 0.3,  volMax: 1.1,  baseMin: 30000,  baseMax: 65000 },
  { id: 'coches',      label: 'Coches de bebé',   icon: '🍼', cat: 'Otros',               pesoMin: 5,  pesoMax: 18,  volMin: 0.08, volMax: 0.3,  baseMin: 20000,  baseMax: 50000 },
];

export const WASTE_CATEGORIES = ['Muebles', 'Camas y descanso', 'Electrodomésticos', 'Construcción y baño', 'Otros'];

export const STRATA = [
  { id: 1, label: 'Estrato 1', subsidy: 70 },
  { id: 2, label: 'Estrato 2', subsidy: 40 },
  { id: 3, label: 'Estrato 3', subsidy: 15 },
  { id: 4, label: 'Estrato 4', subsidy: 0 },
  { id: 5, label: 'Estrato 5', subsidy: 0 },
  { id: 6, label: 'Estrato 6', subsidy: 0 },
];

export const VALLE_CENTER = [6.2442, -75.5812];

export const MUNICIPIOS = [
  { id: 'medellin',   name: 'Medellín',    lat: 6.2442, lng: -75.5812 },
  { id: 'bello',      name: 'Bello',       lat: 6.3373, lng: -75.5558 },
  { id: 'itagui',     name: 'Itagüí',      lat: 6.1719, lng: -75.6112 },
  { id: 'envigado',   name: 'Envigado',    lat: 6.1699, lng: -75.5827 },
  { id: 'sabaneta',   name: 'Sabaneta',    lat: 6.1515, lng: -75.6166 },
  { id: 'estrella',   name: 'La Estrella', lat: 6.1574, lng: -75.6434 },
  { id: 'caldas',     name: 'Caldas',      lat: 6.0918, lng: -75.6364 },
  { id: 'copacabana', name: 'Copacabana',  lat: 6.3485, lng: -75.5090 },
  { id: 'girardota',  name: 'Girardota',   lat: 6.3792, lng: -75.4456 },
  { id: 'barbosa',    name: 'Barbosa',     lat: 6.4393, lng: -75.3317 },
];

export const VALLE_POLYGON = [
  [6.470, -75.300],[6.405, -75.405],[6.345, -75.480],[6.260, -75.525],
  [6.165, -75.545],[6.095, -75.595],[6.060, -75.645],[6.110, -75.670],
  [6.200, -75.655],[6.310, -75.595],[6.390, -75.495],[6.450, -75.395],
];

export function pointInValle(lat, lng) {
  const poly = VALLE_POLYGON;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const yi = poly[i][0], xi = poly[i][1];
    const yj = poly[j][0], xj = poly[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export const TRUCKS = [
  { id: 'T001', plate: 'AMV-123', capacity: 5000, used: 1200, status: 'disponible', lat: 6.2442, lng: -75.5812, driver: 'Carlos Méndez' },
  { id: 'T002', plate: 'AMV-456', capacity: 8000, used: 6500, status: 'en_ruta',    lat: 6.3373, lng: -75.5558, driver: 'Luisa Torres' },
  { id: 'T003', plate: 'AMV-789', capacity: 6000, used: 0,    status: 'disponible', lat: 6.1719, lng: -75.6112, driver: 'Pedro Ríos' },
];

export const INITIAL_REPORTS = [
  { id: 'R001', ciudadano: 'Ana García',   email: 'ana.garcia@gmail.com',   tipo: 'sofa',        peso: 55, foto: null, lat: 6.2089, lng: -75.5712, municipio: 'Medellín',    direccion: 'Cra. 35 #7-50, El Poblado, Medellín',   fecha: '2025-06-04T09:00:00Z', estado: 'pendiente',   tarifa_base: 110000, subsidio: 0,  costo_final: 110000, estrato: 4, camion_id: null },
  { id: 'R002', ciudadano: 'Juan Pérez',   email: 'juan.perez@gmail.com',   tipo: 'neveras',     peso: 75, foto: null, lat: 6.3373, lng: -75.5558, municipio: 'Bello',       direccion: 'Calle 50 #52-18, Bello',                 fecha: '2025-06-04T10:30:00Z', estado: 'asignado',    tarifa_base: 95000,  subsidio: 40, costo_final: 57000,  estrato: 2, camion_id: 'T002' },
  { id: 'R003', ciudadano: 'María López',  email: 'maria.lopez@gmail.com',  tipo: 'colchones',   peso: 38, foto: null, lat: 6.1699, lng: -75.5827, municipio: 'Envigado',    direccion: 'Av. El Poblado #25-30, Envigado',        fecha: '2025-06-04T11:00:00Z', estado: 'recolectado', tarifa_base: 55000,  subsidio: 15, costo_final: 46750,  estrato: 3, camion_id: 'T002' },
  { id: 'R004', ciudadano: 'Roberto Díaz', email: 'roberto.diaz@gmail.com', tipo: 'construccion',peso: 20, foto: null, lat: 6.1719, lng: -75.6112, municipio: 'Itagüí',      direccion: 'Cra. 50A #48-22, Itagüí',               fecha: '2025-06-05T08:00:00Z', estado: 'pendiente',   tarifa_base: 35000,  subsidio: 70, costo_final: 10500,  estrato: 1, camion_id: null },
  { id: 'R005', ciudadano: 'Sandra Ruiz',  email: 'sandra.ruiz@gmail.com',  tipo: 'lavadora',    peso: 80, foto: null, lat: 6.1515, lng: -75.6166, municipio: 'Sabaneta',    direccion: 'Calle 75 Sur #45-12, Sabaneta',          fecha: '2025-06-05T09:30:00Z', estado: 'pendiente',   tarifa_base: 70000,  subsidio: 40, costo_final: 42000,  estrato: 2, camion_id: null },
  { id: 'R006', ciudadano: 'Diego Tobón',  email: 'diego.tobon@gmail.com',  tipo: 'televisores', peso: 18, foto: null, lat: 6.1574, lng: -75.6434, municipio: 'La Estrella', direccion: 'Cra. 60 #80-05, La Estrella',            fecha: '2025-06-05T10:15:00Z', estado: 'pendiente',   tarifa_base: 50000,  subsidio: 70, costo_final: 15000,  estrato: 1, camion_id: null },
];

export const fmt = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export const statusLabel = { pendiente: 'Pendiente', asignado: 'Asignado', recolectado: 'Recolectado', cancelado: 'Cancelado' };
export const statusColor  = { pendiente: '#f59e0b', asignado: '#3b82f6', recolectado: '#10b981', cancelado: '#ef4444' };

export function tarifaBasePorPeso(item, peso) {
  if (!item) return 0;
  const span = item.pesoMax - item.pesoMin;
  const t = span > 0 ? (peso - item.pesoMin) / span : 0;
  const c = Math.max(0, Math.min(1, t));
  return Math.round(item.baseMin + c * (item.baseMax - item.baseMin));
}

export function costoFinal(base, subsidyPct) {
  return Math.round(base * (1 - subsidyPct / 100));
}

export function nearestNeighbor(points, origin) {
  if (!points.length) return [];
  const remaining = [...points];
  const route = [];
  let cur = origin;
  while (remaining.length) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = Math.sqrt((remaining[i].lat - cur.lat) ** 2 + (remaining[i].lng - cur.lng) ** 2);
      if (d < bestD) { bestD = d; best = i; }
    }
    route.push(remaining.splice(best, 1)[0]);
    cur = route[route.length - 1];
  }
  return route;
}
