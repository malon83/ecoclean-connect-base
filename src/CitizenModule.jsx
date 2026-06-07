import React, { useState, useRef } from 'react';
import {
  WASTE_CATALOG, WASTE_CATEGORIES, STRATA, MUNICIPIOS,
  pointInValle, fmt, tarifaBasePorPeso, costoFinal,
} from './data.js';

export default function CitizenModule({ onSubmit, user, subsidyParams }) {
  const effectiveStrata = subsidyParams || STRATA;
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState(WASTE_CATEGORIES[0]);
  const [tipo, setTipo] = useState(null);
  const [estrato, setEstrato] = useState(2);
  const [peso, setPeso] = useState(0);
  const [foto, setFoto] = useState(null);
  const [municipioId, setMunicipioId] = useState('medellin');
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const [outOfArea, setOutOfArea] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const waste = WASTE_CATALOG.find(w => w.id === tipo);
  const stratum = effectiveStrata.find(s => s.id === estrato);
  const muni = MUNICIPIOS.find(m => m.id === municipioId);
  const base = tarifaBasePorPeso(waste, peso);
  const subsidyAmt = Math.round(base * stratum.subsidy / 100);
  const total = costoFinal(base, stratum.subsidy);

  const pickType = (w) => { setTipo(w.id); setPeso(Math.round((w.pesoMin + w.pesoMax) / 2)); setStep(2); };

  const getGeo = () => {
    setLoading(true); setGeoError(false); setOutOfArea(false);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLoading(false);
        if (!pointInValle(lat, lng)) { setOutOfArea(true); return; }
        setCoords({ lat, lng });
      },
      () => { setGeoError(true); setLoading(false); },
      { timeout: 8000 }
    );
  };

  const handleFoto = e => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setFoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = () => {
    const jitter = () => (Math.random() - 0.5) * 0.012;
    const lat = coords?.lat ?? muni.lat + jitter();
    const lng = coords?.lng ?? muni.lng + jitter();
    onSubmit({
      id: 'R' + Date.now(),
      ciudadano: user?.name || 'Usuario App',
      email: user?.email || '',
      tipo, peso, foto, lat, lng,
      municipio: muni.name,
      direccion: address || `${muni.name}, Valle de Aburrá`,
      fecha: new Date().toISOString(), estado: 'pendiente',
      tarifa_base: base, subsidio: stratum.subsidy, costo_final: total, estrato, camion_id: null,
    });
    setSubmitted(true);
  };

  const reset = () => { setStep(1); setTipo(null); setPeso(0); setFoto(null); setCoords(null); setAddress(''); setGeoError(false); setOutOfArea(false); setSubmitted(false); };

  if (submitted) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 64 }}>✅</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#10b981', margin: 0 }}>¡Reporte enviado!</h2>
      <p style={{ color: '#6b7280', maxWidth: 340 }}>Tu solicitud de recolección en <b>{muni.name}</b> fue registrada. Recibirás una notificación cuando sea asignada a un camión.</p>
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 24px', minWidth: 260 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#166534' }}>Costo final con subsidio</p>
        <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700, color: '#15803d' }}>{fmt(total)}</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4ade80' }}>Subsidio {stratum.subsidy}% aplicado ({fmt(subsidyAmt)} de ahorro)</p>
      </div>
      <button onClick={reset} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>Nuevo reporte</button>
    </div>
  );

  const typesInCat = WASTE_CATALOG.filter(w => w.cat === cat);

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 0 40px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? '#10b981' : '#e5e7eb', transition: 'background .3s' }} />)}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>¿Qué tipo de residuo?</h2>
          <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 14 }}>Elige la categoría y luego el residuo a recoger</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {WASTE_CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${cat === c ? '#10b981' : '#e5e7eb'}`, background: cat === c ? '#ecfdf5' : '#fff', color: cat === c ? '#15803d' : '#374151', fontWeight: cat === c ? 700 : 500, cursor: 'pointer', fontSize: 13 }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {typesInCat.map(w => (
              <button key={w.id} onClick={() => pickType(w)}
                style={{ background: tipo === w.id ? '#ecfdf5' : '#fff', border: `2px solid ${tipo === w.id ? '#10b981' : '#e5e7eb'}`, borderRadius: 12, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all .2s' }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{w.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{w.label}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{w.pesoMin}–{w.pesoMax} kg</div>
                <div style={{ fontSize: 11, color: '#10b981', marginTop: 1, fontWeight: 600 }}>desde {fmt(w.baseMin)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && waste && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Detalles y subsidio</h2>
          <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>El peso y el estrato determinan la tarifa. La foto es obligatoria.</p>

          <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Peso aproximado: <span style={{ color: '#10b981' }}>{peso} kg</span></label>
          <input type="range" min={waste.pesoMin} max={waste.pesoMax} step={1} value={peso} onChange={e => setPeso(parseInt(e.target.value))} style={{ width: '100%', marginBottom: 4, accentColor: '#10b981' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 20 }}><span>{waste.pesoMin} kg</span><span>{waste.pesoMax} kg</span></div>

          <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Estrato socioeconómico</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {effectiveStrata.map(s => (
              <button key={s.id} onClick={() => setEstrato(s.id)}
                style={{ padding: '8px 14px', borderRadius: 8, border: `2px solid ${estrato === s.id ? '#10b981' : '#e5e7eb'}`, background: estrato === s.id ? '#ecfdf5' : '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                {s.id} <span style={{ fontWeight: 400, color: '#6b7280' }}>({s.subsidy}%)</span>
              </button>
            ))}
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}><span>Tarifa base ({peso} kg)</span><span>{fmt(base)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10b981' }}><span>Subsidio {stratum.subsidy}%</span><span>-{fmt(subsidyAmt)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 6, color: '#15803d', borderTop: '1px solid #86efac', paddingTop: 6 }}><span>Total a pagar</span><span>{fmt(total)}</span></div>
          </div>

          <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Foto del residuo *</label>
          <div onClick={() => fileRef.current.click()} style={{ border: '2px dashed #d1fae5', borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', background: foto ? '#f0fdf4' : '#fafafa', marginBottom: 20 }}>
            {foto ? <img src={foto} alt="preview" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8 }} /> : (<div><div style={{ fontSize: 32 }}>📷</div><p style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>Toca para tomar o subir foto</p></div>)}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>← Atrás</button>
            <button onClick={() => foto ? setStep(3) : alert('La foto es obligatoria')} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Continuar →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Ubicación del residuo</h2>
          <p style={{ color: '#6b7280', marginBottom: 18, fontSize: 14 }}>El servicio solo cubre el Área Metropolitana del Valle de Aburrá.</p>

          <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Municipio</label>
          <select value={municipioId} onChange={e => setMunicipioId(e.target.value)}
            style={{ width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 15, boxSizing: 'border-box', marginBottom: 16, background: '#fff' }}>
            {MUNICIPIOS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Dirección</label>
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder={`Ej: Cra. 43A #5-15, ${muni.name}`}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 15, boxSizing: 'border-box', marginBottom: 16 }} />

          <button onClick={getGeo} disabled={loading}
            style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', marginBottom: 14, fontSize: 14 }}>
            {loading ? 'Obteniendo ubicación…' : '📍 Usar mi ubicación GPS (opcional)'}
          </button>

          {coords && !outOfArea && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#166534' }}>
              ✅ Ubicación GPS capturada dentro del área: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </div>
          )}
          {geoError && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#92400e' }}>
              GPS no disponible. Usaremos el municipio y la dirección que indicaste.
            </div>
          )}
          {outOfArea && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#991b1b' }}>
              🚫 Tu ubicación GPS está <b>fuera del Valle de Aburrá</b>. El servicio no tiene cobertura ahí.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>← Atrás</button>
            <button onClick={() => setStep(4)} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Ver resumen →</button>
          </div>
        </div>
      )}

      {step === 4 && waste && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Confirmar reporte</h2>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            {foto && <img src={foto} alt="residuo" style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>{waste.icon}</span>
                <div><p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{waste.label}</p><p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{peso} kg · {waste.cat}</p></div>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>📍 {address || `${muni.name}, Valle de Aburrá`} <span style={{ color: '#10b981', fontWeight: 600 }}>· {muni.name}</span></div>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}><span style={{ color: '#6b7280' }}>Tarifa base</span><span>{fmt(base)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}><span style={{ color: '#10b981' }}>Subsidio {stratum.subsidy}% (estrato {estrato})</span><span style={{ color: '#10b981' }}>-{fmt(subsidyAmt)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 4, color: '#15803d' }}><span>Total</span><span>{fmt(total)}</span></div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>← Atrás</button>
            <button onClick={handleSubmit} style={{ flex: 2, padding: '14px', borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>Enviar reporte 🚀</button>
          </div>
        </div>
      )}
    </div>
  );
}
