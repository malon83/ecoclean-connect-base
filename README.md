# EcoClean Connect 🌿

Plataforma de recolección de residuos voluminosos para el Área Metropolitana del Valle de Aburrá.

## Publicar en StackBlitz

1. Ve a [stackblitz.com](https://stackblitz.com) → **New Project → Upload files** (o usa la CLI `npx @stackblitz/cli`).
2. Sube todos los archivos del proyecto.
3. StackBlitz ejecuta `npm install` y `npm run dev` automáticamente.

## Configurar Google OAuth (autenticación real)

### 1. Crear credenciales en Google Cloud Console

1. Ve a [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Crea un proyecto (o selecciona uno existente)
3. Click **+ Crear credenciales → ID de cliente de OAuth 2.0**
4. Tipo de aplicación: **Aplicación web**
5. Agrega los orígenes JS autorizados:
   - `http://localhost:5173` (desarrollo local)
   - `https://TU_PROYECTO.stackblitz.io` (StackBlitz — copia la URL una vez desplegado)
6. Copia el **Client ID** generado

### 2. Configurar la variable de entorno

**En desarrollo local:** crea un archivo `.env` en la raíz:
```
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

**En StackBlitz:** ve a ⚙️ Settings → Environment Variables y agrega:
```
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

### 3. Pantalla de consentimiento OAuth

En Google Cloud Console → APIs y servicios → Pantalla de consentimiento:
- Tipo de usuario: **Externo** (o Interno si es una organización G Workspace)
- Agrega los scopes: `email`, `profile`, `openid`
- Agrega tu correo como usuario de prueba mientras está en modo prueba

## Módulos

| Módulo | Descripción |
|--------|-------------|
| 👤 Ciudadano | Flujo de 4 pasos para reportar residuos con foto, estrato y ubicación |
| 🗺 Mapa | Vista pública de todos los reportes en Leaflet con filtros por estado |
| 🚛 Conductor | Panel de camiones con optimización de ruta vecino más cercano |
| 🏛 Alcaldía | Dashboard ejecutivo, tarifas, gestión de subsidios por estrato |

## Stack

- React 18 + Vite
- @react-oauth/google (popup flow — no backend necesario)
- Leaflet 1.9 para mapas
- Sin base de datos — estado en memoria (React state + localStorage para la sesión)
