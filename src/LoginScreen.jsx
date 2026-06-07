import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function GoogleG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export { GoogleG };

export default function LoginScreen({ onLogin }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Uses popup flow — requests profile + email scopes
  const loginWithGoogle = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Fetch user profile from Google
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();
        onLogin({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          sub: profile.sub,
          color: '#10b981',
        });
      } catch (e) {
        setError('No se pudo obtener el perfil de Google. Intenta de nuevo.');
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error(err);
      setError('No se completó el inicio de sesión. Intenta de nuevo.');
      setLoading(false);
    },
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #ecfdf5 0%, #f8fafc 55%, #eff6ff 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 10px 30px -8px rgba(16,185,129,.5)',
          }}>♻️</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: '#0f172a', letterSpacing: '-0.5px' }}>EcoClean Connect</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Recolección de residuos voluminosos · Valle de Aburrá
          </div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18,
          padding: 28, boxShadow: '0 20px 50px -20px rgba(2,6,23,.25)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
            Inicia sesión para continuar
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 22px' }}>
            Usa tu cuenta de Google para reportar y hacer seguimiento a tus recolecciones.
          </p>

          <button
            onClick={() => { setError(''); loginWithGoogle(); }}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, padding: '13px 16px', borderRadius: 10, border: '1px solid #dadce0',
              background: loading ? '#f1f5f9' : '#fff', cursor: loading ? 'default' : 'pointer',
              fontWeight: 600, fontSize: 15, color: '#3c4043', transition: 'all .15s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#f8faff'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,.2)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = loading ? '#f1f5f9' : '#fff'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <GoogleG />
            {loading ? 'Autenticando…' : 'Continuar con Google'}
          </button>

          {error && (
            <div style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 8,
              background: '#fee2e2', border: '1px solid #fca5a5',
              color: '#991b1b', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* ── Nota para entornos sin Client ID configurado ── */}
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div style={{
              marginTop: 16, padding: '12px 14px', borderRadius: 8,
              background: '#fef3c7', border: '1px solid #fcd34d',
              color: '#92400e', fontSize: 12, lineHeight: 1.5,
            }}>
              <strong>⚠️ Falta el Client ID de Google.</strong> Crea una credencial OAuth 2.0 en{' '}
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer"
                style={{ color: '#92400e', fontWeight: 700 }}>
                console.cloud.google.com
              </a>{' '}
              y agrégalo como <code>VITE_GOOGLE_CLIENT_ID</code> en un archivo <code>.env</code>.
            </div>
          )}

          <div style={{ marginTop: 18, fontSize: 11, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
            Al continuar aceptas los términos del servicio de gestión de residuos del
            Área Metropolitana del Valle de Aburrá.
          </div>
        </div>
      </div>
    </div>
  );
}
