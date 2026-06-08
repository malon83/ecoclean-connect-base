# Manual de usuario — EcoClean Connect

Guía de uso de la plataforma **EcoClean Connect**, la solución para reportar y coordinar la recolección de residuos voluminosos en el Área Metropolitana del Valle de Aburrá.

La aplicación tiene una barra superior con cuatro vistas: **Ciudadano**, **Mapa**, **Conductor** y **Alcaldía**. En la esquina superior derecha se muestra el indicador de solicitudes pendientes y el menú de la cuenta, con inicio de sesión mediante Google.

---

## 1. Acceso a la plataforma

1. Abra la aplicación en `https://ecoclean-connect-base.vercel.app/`.
2. Inicie sesión con su cuenta de Google desde el menú superior derecho.
3. Use las pestañas de la barra superior para moverse entre las vistas según su rol.

---

## 2. Vista Ciudadano: reportar un residuo

Esta vista permite crear una solicitud de recolección en cuatro pasos, indicados por la barra de progreso de la parte superior.

### Paso 1. Tipo de residuo

1. Seleccione una categoría: **Muebles**, **Camas y descanso**, **Electrodomésticos**, **Construcción y baño** u **Otros**.
2. Elija el residuo dentro de la categoría. Cada tarjeta muestra el rango de peso y la tarifa de referencia (por ejemplo, Sofá, 40 a 70 kg, desde $ 60.000).

### Paso 2. Detalles y subsidio

1. Ajuste el **peso aproximado** con el control deslizante, dentro del rango del residuo.
2. Seleccione su **estrato socioeconómico** (1 a 6). El sistema aplica el subsidio correspondiente: 70 % para estrato 1, 40 % para estrato 2, 15 % para estrato 3 y 0 % para estratos 4, 5 y 6.
3. Revise el resumen de la tarifa: tarifa base según el peso, subsidio aplicado y **total a pagar**.
4. Cargue la **foto del residuo**. Es obligatoria para continuar.
5. Pulse **Continuar**.

### Paso 3. Ubicación

1. Indique el punto de recolección sobre el mapa o mediante la dirección.
2. Confirme el municipio del Valle de Aburrá.

### Paso 4. Confirmación

1. Revise el resumen del reporte: residuo, peso, estrato, costo y ubicación.
2. Envíe la solicitud. El reporte queda en estado **Pendiente** y aparece en el mapa general y en los paneles del conductor y de la alcaldía.

---

## 3. Vista Mapa

Muestra todos los reportes sobre un mapa del Área Metropolitana del Valle de Aburrá (Leaflet con OpenStreetMap).

- Cada punto representa un reporte; el color indica su estado.
- Use los controles **+** y **−** para acercar o alejar.
- Es una vista de consulta general de la actividad en la ciudad.

---

## 4. Vista Conductor

Panel operativo para los conductores de los camiones recolectores.

### Mi camión

1. Seleccione su camión en la lista (por ejemplo, AMV-123 – Carlos Méndez).
2. Revise el **estado** (disponible o en ruta), la **capacidad** (5.000 kg) y el **porcentaje utilizado**.

### Optimizar ruta

1. Pulse **Optimizar ruta** para ordenar las solicitudes por cercanía y trazar el recorrido más eficiente desde la posición del camión.
2. La ruta y las paradas se muestran sobre el mapa, junto con la posición del camión.

### Solicitudes pendientes

1. Revise la lista de solicitudes, cada una con el residuo, la dirección y el estado.
2. Pulse **Asignar** para tomar una solicitud pendiente; el reporte pasa a **Asignado**.
3. Cuando recoja el residuo, márquelo como **Recolectado**.

---

## 5. Vista Alcaldía

Panel de control para la administración local. Incluye cinco secciones.

### 5.1 Dashboard

Muestra los indicadores generales:

- **Total de reportes**, **Pendientes**, **En proceso** y **Recolectados**.
- **Recaudo estimado** (lo que pagan los ciudadanos) y **subsidio aportado por la alcaldía**.
- **Estado de camiones**, con el porcentaje de utilización y la disponibilidad de cada uno.
- **Actividad reciente**, con los últimos residuos recolectados, el ciudadano y el municipio.

### 5.2 Mapa global

Vista de todos los reportes y camiones sobre el mapa del área metropolitana, para el seguimiento territorial.

### 5.3 Reportes

Tabla con todas las solicitudes. Permite filtrar por estado: **Todos**, **Pendiente**, **Asignado** y **Recolectado**.

- Columnas: ID, ciudadano, tipo de residuo, municipio, estado, costo y acciones.
- Acción **Aprobar**: aprueba un reporte pendiente y lo pasa a asignado.
- Acción **Confirmar**: confirma la recolección de un reporte asignado.

### 5.4 Tarifas

Tarifario base de los residuos voluminosos, organizado por categoría. Para cada residuo muestra el rango de peso, el rango de volumen y la tarifa base mínima y máxima. La tarifa final al ciudadano se calcula interpolando por el peso declarado y aplicando el subsidio del estrato.

### 5.5 Subsidios

Parámetros de subsidio por estrato. Permite revisar el porcentaje de cada estrato y ver un ejemplo del valor que pagaría el ciudadano. Los cambios se aplican a los reportes nuevos; los existentes conservan el subsidio del momento de su creación.

---

## 6. Flujo completo de un reporte

| Etapa | Quién la realiza | Resultado |
|---|---|---|
| Crear reporte | Ciudadano | Estado **Pendiente** |
| Aprobar o asignar | Alcaldía o conductor | Estado **Asignado** |
| Optimizar ruta y recoger | Conductor | Residuo recogido |
| Confirmar | Alcaldía o conductor | Estado **Recolectado** |

---

## 7. Preguntas frecuentes

**¿Por qué la foto es obligatoria?**
La foto permite verificar el residuo, evitar reportes falsos y dar al conductor una referencia visual de lo que debe recoger.

**¿Cómo se calcula lo que pago?**
A partir del peso declarado se obtiene la tarifa base del residuo y luego se aplica el subsidio de su estrato. El total se muestra antes de enviar la solicitud.

**¿La ubicación es exacta?**
Cuando se ingresa por dirección y no por GPS, el punto puede presentar un pequeño desfase. Para la versión final se prevé mejorar la precisión con geocodificación inversa.

---

*Manual de usuario de EcoClean Connect (versión base / MVP). Equipo 35 · Hackathon Beca Ser ANDI 2026 · EAFIT.*
