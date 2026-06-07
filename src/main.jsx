import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

// ⚠️  REEMPLAZA con tu propio Client ID de Google OAuth 2.0
// Consola: https://console.cloud.google.com/apis/credentials
// Tipo: "Aplicación web" · Origen JS autorizado: http://localhost:5173
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  ''; // ← pega tu Client ID aquí o en .env como VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
