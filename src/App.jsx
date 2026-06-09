import React, { useState, useEffect, lazy, Suspense } from 'react';
import { STRATA, TRUCKS } from './data.js';
import { supabase } from './supabase.js';
import LoginScreen, { GoogleG } from './LoginScreen.jsx';

// Tab modules are loaded on demand so heavy deps (e.g. Leaflet in the map)
// stay out of the initial bundle until their tab is opened.
const CitizenModule = lazy(() => import('./CitizenModule.jsx'));
const LeafletMap = lazy(() => import('./LeafletMap.jsx'));
const DriverModule = lazy(() => import('./DriverModule.jsx'));
const AdminModule = lazy(() => import('./AdminModule.jsx'));


const SESSION_KEY = 'ecoclean_user';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  });
  const [activeModule, setActiveModule] = useState('citizen');
  const [reports, setReports] = useState([]);
  const [trucks] = useState(TRUCKS);
  const [subsidyParams, setSubsidyParams] = useState(STRATA.map(s => ({ ...s })));
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);

  const login = (acc) => { localStorage.setItem(SESSION_KEY, JSON.stringify(acc)); setUser(acc); };
  const logout = () => { localStorage.removeItem(SESSION_KEY); setUser(null); setMenuOpen(false); setActiveModule('citizen'); };

  useEffect(() => {
    async function fetchReports() {
      setLoadingReports(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('fecha', { ascending: false });
      if (!error && data) setReports(data);
      setLoadingReports(false);
    }
    fetchReports();
  }, []);

  const handleNewReport = async (report) => {
    const { error } = await supabase.from('reports').insert(report);
    if (!error) setReports(prev => [report, ...prev]);
  };

  const handleStatusChange = async (reportId, newStatus, truckId = null) => {
    const update = { estado: newStatus };
    if (truckId) update.camion_id = truckId;
    const { error } = await supabase.from('reports').update(update).eq('id', reportId);
    if (!error) {
      setReports(prev => prev.map(r =>
        r.id === reportId ? { ...r, estado: newStatus, camion_id: truckId || r.camion_id } : r
      ));
    }
  };

  const handleSubsidyChange = (stratoId, newPct) =>
    setSubsidyParams(prev => prev.map(s => s.id === stratoId ? { ...s, subsidy: newPct } : s));

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (!e.target.closest('[data-usermenu]')) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (!user) return <LoginScreen onLogin={login} />;

  const nav = [
    { id: 'citizen', label: 'Ciudadano', icon: '👤' },
    { id: 'map',     label: 'Mapa',      icon: '🗺' },
    { id: 'driver',  label: 'Conductor', icon: '🚛' },
    { id: 'admin',   label: 'Alcaldía',  icon: '🏛' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♻️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111', letterSpacing: '-0.3px' }}>EcoClean Connect</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: -2 }}>Residuos voluminosos · Área Metropolitana del Valle de Aburrá</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {loadingReports ? (
              <span style={{ background: '#f1f5f9', color: '#9ca3af', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                Cargando…
              </span>
            ) : (
              <span style={{ background: '#f0fdf4', color: '#15803d', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
                {reports.filter(r => r.estado === 'pendiente').length} pendientes
              </span>
            )}

            <div style={{ position: 'relative' }} data-usermenu>
              <button onClick={() => setMenuOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: menuOpen ? '#f1f5f9' : 'transparent', border: '1px solid #e5e7eb', borderRadius: 22, padding: '4px 8px 4px 4px', cursor: 'pointer' }}>
                {user.picture
                  ? <img src={user.picture} alt={user.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: 30, height: 30, borderRadius: '50%', background: user.color || '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{(user.name || 'U')[0]}</div>
                }
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                <span style={{ color: '#9ca3af', fontSize: 10 }}>▼</span>
              </button>

              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 48, width: 260, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 12px 30px -10px rgba(2,6,23,.3)', padding: 8, zIndex: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 14px' }}>
                    {user.picture
                      ? <img src={user.picture} alt={user.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 40, height: 40, borderRadius: '50%', background: user.color || '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17 }}>{(user.name || 'U')[0]}</div>
                    }
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#202124' }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderTop: '1px solid #f1f5f9', fontSize: 11, color: '#9ca3af' }}>
                    <GoogleG size={14} /> Sesión iniciada con Google
                  </div>
                  <button onClick={logout} style={{ width: '100%', marginTop: 6, padding: '10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Cerrar sesión</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setActiveModule(n.id)}
              style={{ padding: '12px 20px', border: 'none', background: 'transparent', borderBottom: `3px solid ${activeModule === n.id ? '#10b981' : 'transparent'}`, cursor: 'pointer', fontWeight: activeModule === n.id ? 700 : 400, color: activeModule === n.id ? '#10b981' : '#6b7280', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', height: 'calc(100vh - 130px)', overflow: 'auto' }}>
        <Suspense fallback={<div style={{ padding: 24, color: '#9ca3af', fontSize: 14 }}>Cargando…</div>}>
          {activeModule === 'citizen' && <CitizenModule onSubmit={handleNewReport} user={user} subsidyParams={subsidyParams} />}
          {activeModule === 'map' && (
            <div style={{ height: '100%' }}>
              <div style={{ height: 'calc(100% - 0px)', minHeight: 380, borderRadius: 12, overflow: 'hidden' }}>
                <LeafletMap reports={reports} />
              </div>
            </div>
          )}
          {activeModule === 'driver' && <DriverModule reports={reports} trucks={trucks} onStatusChange={handleStatusChange} />}
          {activeModule === 'admin' && <AdminModule reports={reports} trucks={trucks} subsidyParams={subsidyParams} onStatusChange={handleStatusChange} onSubsidyChange={handleSubsidyChange} />}
        </Suspense>
      </main>
    </div>
  );
}
