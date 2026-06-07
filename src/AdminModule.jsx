import React, { useState } from 'react';
import { WASTE_CATALOG, WASTE_CATEGORIES, fmt, statusLabel, statusColor } from './data.js';
import LeafletMap from './LeafletMap.jsx';

export default function AdminModule({ reports, trucks, subsidyParams, onStatusChange, onSubsidyChange }) {
  const [tab, setTab] = useState('dashboard');
  const [filter, setFilter] = useState('todos');
  const [tarifaCat, setTarifaCat] = useState(WASTE_CATEGORIES[0]);

  const stats = {
    total: reports.length,
    pendiente: reports.filter(r => r.estado === 'pendiente').length,
    asignado: reports.filter(r => r.estado === 'asignado').length,
    recolectado: reports.filter(r => r.estado === 'recolectado').length,
  };
  const recaudo = reports.reduce((s, r) => s + (r.costo_final || 0), 0);
  const subsidiado = reports.reduce((s, r) => s + Math.round((r.tarifa_base || 0) * (r.subsidio || 0) / 100), 0);
  const filtered = filter === 'todos' ? reports : reports.filter(r => r.estado === filter);
  const tarifaRows = WASTE_CATALOG.filter(w => w.cat === tarifaCat);

  return (
    <div style={{ height: '100%' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        {[['dashboard', '📊 Dashboard'], ['mapa', '🗺 Mapa global'], ['reportes', '📋 Reportes'], ['tarifas', '🏷 Tarifas'], ['subsidios', '💰 Subsidios']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', border: 'none', background: tab === key ? '#fff' : 'transparent', borderBottom: tab === key ? '2px solid #10b981' : '2px solid transparent', fontWeight: tab === key ? 700 : 400, cursor: 'pointer', color: tab === key ? '#10b981' : '#6b7280', fontSize: 13 }}>{label}</button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Total reportes', val: stats.total, color: '#6366f1', bg: '#eef2ff' },
              { label: 'Pendientes', val: stats.pendiente, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'En proceso', val: stats.asignado, color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Recolectados', val: stats.recolectado, color: '#10b981', bg: '#f0fdf4' },
            ].map(c => (
              <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: 12, padding: '16px 14px' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 14px' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Recaudo estimado (ciudadanos)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#15803d' }}>{fmt(recaudo)}</div>
            </div>
            <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '16px 14px' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Subsidio aportado por la Alcaldía</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5' }}>{fmt(subsidiado)}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Estado de camiones</div>
              {trucks.map(t => {
                const pct = Math.round(t.used / t.capacity * 100);
                return (
                  <div key={t.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}><span style={{ fontWeight: 600 }}>🚛 {t.plate}</span><span style={{ color: '#6b7280' }}>{t.driver}</span></div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 20, height: 6 }}><div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? '#ef4444' : '#10b981', borderRadius: 20 }} /></div>
                      <span style={{ fontSize: 11, color: '#6b7280', minWidth: 40 }}>{pct}%</span>
                      <span style={{ fontSize: 11, background: t.status === 'disponible' ? '#f0fdf4' : '#fef3c7', color: t.status === 'disponible' ? '#15803d' : '#92400e', borderRadius: 6, padding: '2px 6px' }}>{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Actividad reciente</div>
              {reports.slice(-5).reverse().map(r => {
                const waste = WASTE_CATALOG.find(w => w.id === r.tipo);
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: 20 }}>{waste?.icon}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{waste?.label}</div><div style={{ fontSize: 11, color: '#6b7280' }}>{r.ciudadano} · {r.municipio || '—'}</div></div>
                    <span style={{ background: statusColor[r.estado] + '22', color: statusColor[r.estado], borderRadius: 6, padding: '2px 6px', fontSize: 11, fontWeight: 600 }}>{statusLabel[r.estado]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'mapa' && (
        <div style={{ height: 'calc(100% - 60px)', minHeight: 400, borderRadius: 12, overflow: 'hidden' }}>
          <LeafletMap reports={reports} trucks={trucks} />
        </div>
      )}

      {tab === 'reportes' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {['todos', 'pendiente', 'asignado', 'recolectado'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${filter === s ? (statusColor[s] || '#10b981') : '#e5e7eb'}`, background: filter === s ? (statusColor[s] || '#ecfdf5') + '33' : '#fff', color: filter === s ? (statusColor[s] || '#15803d') : '#374151', fontWeight: filter === s ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>
                {statusLabel[s] || 'Todos'} ({s === 'todos' ? reports.length : reports.filter(r => r.estado === s).length})
              </button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  {['ID', 'Ciudadano', 'Tipo', 'Municipio', 'Estado', 'Costo', 'Acciones'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const waste = WASTE_CATALOG.find(w => w.id === r.tipo);
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{r.id.length > 8 ? r.id.slice(0, 8) : r.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.ciudadano}</td>
                      <td style={{ padding: '10px 12px' }}>{waste?.icon} {waste?.label}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{r.municipio || '—'}</td>
                      <td style={{ padding: '10px 12px' }}><span style={{ background: statusColor[r.estado] + '22', color: statusColor[r.estado], borderRadius: 6, padding: '3px 9px', fontWeight: 600 }}>{statusLabel[r.estado]}</span></td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#15803d' }}>{fmt(r.costo_final)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {r.estado === 'pendiente' && <button onClick={() => onStatusChange(r.id, 'asignado', trucks[0].id)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Aprobar</button>}
                        {r.estado === 'asignado' && <button onClick={() => onStatusChange(r.id, 'recolectado')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#f0fdf4', color: '#15803d', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Confirmar</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'tarifas' && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Tarifario de residuos voluminosos</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Tarifas base (antes de subsidio) según el peso del residuo.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {WASTE_CATEGORIES.map(c => (
              <button key={c} onClick={() => setTarifaCat(c)}
                style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${tarifaCat === c ? '#10b981' : '#e5e7eb'}`, background: tarifaCat === c ? '#ecfdf5' : '#fff', color: tarifaCat === c ? '#15803d' : '#374151', fontWeight: tarifaCat === c ? 700 : 500, cursor: 'pointer', fontSize: 13 }}>{c}</button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  {['Residuo', 'Peso (kg)', 'Volumen (m³)', 'Tarifa base mín.', 'Tarifa base máx.'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tarifaRows.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{w.icon} {w.label}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{w.pesoMin} – {w.pesoMax}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{w.volMin} – {w.volMax}</td>
                    <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 600 }}>{fmt(w.baseMin)}</td>
                    <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 600 }}>{fmt(w.baseMax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 14, fontSize: 13, color: '#1e40af' }}>
            ℹ️ La tarifa final al ciudadano se calcula interpolando por el peso declarado y aplicando el subsidio del estrato correspondiente.
          </div>
        </div>
      )}

      {tab === 'subsidios' && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Parámetros de subsidio por estrato</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>Estratos 1, 2 y 3 reciben subsidio; estratos 4, 5 y 6 pagan tarifa plena.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {subsidyParams.map(s => (
              <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Estrato {s.id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <input type="range" min={0} max={100} step={5} value={s.subsidy} onChange={e => onSubsidyChange(s.id, parseInt(e.target.value))} style={{ flex: 1, accentColor: '#10b981' }} />
                  <span style={{ fontWeight: 700, fontSize: 20, color: '#10b981', minWidth: 44 }}>{s.subsidy}%</span>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8, fontSize: 12, color: '#6b7280' }}>Ej: tarifa $80,000 → ciudadano paga <span style={{ fontWeight: 700, color: '#15803d' }}>{fmt(80000 * (1 - s.subsidy / 100))}</span></div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: 14, fontSize: 13, color: '#92400e' }}>⚠️ Los cambios se aplican a nuevos reportes. Los reportes existentes mantienen el subsidio al momento de creación.</div>
        </div>
      )}
    </div>
  );
}
