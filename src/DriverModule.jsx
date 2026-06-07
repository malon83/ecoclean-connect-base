import React, { useState } from 'react';
import { WASTE_CATALOG, fmt, statusLabel, statusColor, nearestNeighbor } from './data.js';
import LeafletMap from './LeafletMap.jsx';

export default function DriverModule({ reports, trucks, onStatusChange }) {
  const [selectedTruck, setSelectedTruck] = useState(trucks[0]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const pending = reports.filter(r => r.estado === 'pendiente' || r.estado === 'asignado');

  const optimize = () => setOptimizedRoute(nearestNeighbor(pending, { lat: selectedTruck.lat, lng: selectedTruck.lng }));
  const usedPct = Math.round(selectedTruck.used / selectedTruck.capacity * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: '100%' }}>
      <div style={{ overflowY: 'auto' }}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🚛 Mi camión</div>
          <select value={selectedTruck.id} onChange={e => setSelectedTruck(trucks.find(t => t.id === e.target.value))}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: 10, fontSize: 14 }}>
            {trucks.map(t => <option key={t.id} value={t.id}>{t.plate} – {t.driver}</option>)}
          </select>
          <div style={{ fontSize: 13, color: '#1e40af', marginBottom: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: selectedTruck.status === 'disponible' ? '#10b981' : '#f59e0b', marginRight: 6 }} />
            {selectedTruck.status === 'disponible' ? 'Disponible' : 'En ruta'}
          </div>
          <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>Capacidad: {selectedTruck.used}kg / {selectedTruck.capacity}kg</div>
          <div style={{ background: '#dbeafe', borderRadius: 20, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${usedPct}%`, height: '100%', background: usedPct > 80 ? '#ef4444' : '#3b82f6', transition: 'width .5s', borderRadius: 20 }} />
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{usedPct}% utilizado</div>
        </div>

        <button onClick={optimize} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: 14, fontSize: 14 }}>🗺 Optimizar ruta</button>

        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{optimizedRoute ? 'Ruta optimizada' : 'Solicitudes pendientes'} ({(optimizedRoute || pending).length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(optimizedRoute || pending).map((r, idx) => {
            const waste = WASTE_CATALOG.find(w => w.id === r.tipo);
            return (
              <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {optimizedRoute && <span style={{ background: '#1d4ed8', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>}
                  <span style={{ fontSize: 18 }}>{waste?.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{waste?.label}</span>
                  <span style={{ marginLeft: 'auto', background: statusColor[r.estado] + '22', color: statusColor[r.estado], borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>{statusLabel[r.estado]}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>📍 {r.direccion}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {r.estado === 'pendiente' && <button onClick={() => onStatusChange(r.id, 'asignado', selectedTruck.id)} style={{ flex: 1, padding: '5px', borderRadius: 6, border: 'none', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Asignar</button>}
                  {r.estado === 'asignado' && <button onClick={() => onStatusChange(r.id, 'recolectado', selectedTruck.id)} style={{ flex: 1, padding: '5px', borderRadius: 6, border: 'none', background: '#f0fdf4', color: '#15803d', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>✅ Recolectado</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ borderRadius: 12, overflow: 'hidden', minHeight: 400 }}>
        <LeafletMap reports={pending} trucks={[selectedTruck]} optimizedRoute={optimizedRoute} />
      </div>
    </div>
  );
}
