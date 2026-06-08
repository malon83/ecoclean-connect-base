# Modelo de datos — EcoClean Connect

Documento del modelo de datos del MVP de **EcoClean Connect**, plataforma para el reporte, coordinación y recolección de residuos voluminosos en el Área Metropolitana del Valle de Aburrá.

Este modelo describe las entidades, los campos, las relaciones y la lógica de negocio tal como funcionan en la aplicación base (`ecoclean-connect-base`), construida con React (Vite), Leaflet con OpenStreetMap para los mapas e inicio de sesión con Google. En el MVP los datos se cargan desde un conjunto de simulación (`data.js`); en la versión productiva, estas entidades corresponden a tablas de una base de datos relacional.

---

## 1. Visión general

La aplicación organiza la información en torno a un actor central, el **reporte de recolección**, que conecta a cuatro entidades: el **ciudadano** que solicita, el **residuo** del catálogo, el **camión** que recoge y los **parámetros** de tarifa y subsidio que determinan el costo.

| Entidad | Descripción |
|---|---|
| Usuario | Persona que usa la plataforma con un rol (ciudadano, conductor o alcaldía). |
| Categoría | Agrupación de residuos voluminosos. |
| Residuo (catálogo) | Tipo de residuo con peso, volumen y tarifa base. |
| Subsidio | Porcentaje de descuento por estrato socioeconómico. |
| Reporte | Solicitud de recolección creada por un ciudadano. |
| Camión | Vehículo recolector con capacidad y estado. |
| Ruta | Secuencia de recolección asignada a un camión. |

---

## 2. Catálogo de residuos

El catálogo se organiza en cinco categorías. Cada residuo tiene un rango de peso, un rango de volumen y una tarifa base que va de un mínimo a un máximo (la tarifa final se interpola según el peso declarado).

### Muebles

| Residuo | Peso (kg) | Volumen (m³) | Tarifa base mín. | Tarifa base máx. |
|---|---|---|---|---|
| Sofá | 40 – 70 | 0.8 – 2.2 | $ 60.000 | $ 160.000 |
| Armario | 50 – 90 | 0.4 – 2.5 | $ 50.000 | $ 180.000 |
| Sillas (juego) | 4 – 7 | 0.08 – 0.25 | $ 150.000 | $ 350.000 |
| Estantería | 20 – 50 | 0.15 – 0.8 | $ 30.000 | $ 90.000 |
| Cómoda | 20 – 50 | 0.2 – 0.6 | $ 40.000 | $ 95.000 |
| Tocador | 20 – 50 | 0.3 – 0.9 | $ 45.000 | $ 110.000 |

### Camas y descanso

| Residuo | Peso (kg) | Volumen (m³) | Tarifa base mín. | Tarifa base máx. |
|---|---|---|---|---|
| Camas | 25 – 50 | 0.3 – 1.8 | $ 45.000 | $ 140.000 |
| Colchones | 25 – 50 | 0.3 – 1.2 | $ 40.000 | $ 70.000 |
| Base de cama | 25 – 50 | 0.25 – 1.2 | $ 35.000 | $ 95.000 |
| Somieres | 25 – 50 | 0.1 – 0.5 | $ 25.000 | $ 65.000 |

### Electrodomésticos

| Residuo | Peso (kg) | Volumen (m³) | Tarifa base mín. | Tarifa base máx. |
|---|---|---|---|---|
| Neveras | 60 – 90 | 0.2 – 1.5 | $ 40.000 | $ 150.000 |
| Lavadora | 60 – 90 | 0.25 – 0.55 | $ 45.000 | $ 90.000 |
| Estufas | 25 – 45 | 0.1 – 0.45 | $ 30.000 | $ 80.000 |
| Televisores | 5 – 25 | 0.03 – 0.35 | $ 20.000 | $ 65.000 |
| Equipo de sonido | 5 – 25 | 0.02 – 0.25 | $ 20.000 | $ 70.000 |

### Construcción y baño

| Residuo | Peso (kg) | Volumen (m³) | Tarifa base mín. | Tarifa base máx. |
|---|---|---|---|---|
| Mat. construcción | 10 – 25 | 0.02 – 0.05 | $ 0 | $ 55.000 |
| Puertas | 10 – 25 | 0.04 – 0.12 | $ 30.000 | $ 85.000 |
| Ventanas | 10 – 25 | 0.03 – 0.2 | $ 20.000 | $ 60.000 |
| Inodoros | 10 – 35 | 0.1 – 0.25 | $ 30.000 | $ 65.000 |
| Lavamanos | 10 – 35 | 0.05 – 0.22 | $ 20.000 | $ 55.000 |

### Otros

| Residuo | Peso (kg) | Volumen (m³) | Tarifa base mín. | Tarifa base máx. |
|---|---|---|---|---|
| Alfombras | 5 – 18 | 0.02 – 0.15 | $ 20.000 | $ 55.000 |
| Bicicletas | 5 – 18 | 0.3 – 1.1 | $ 30.000 | $ 65.000 |
| Coches de bebé | 5 – 18 | 0.08 – 0.3 | $ 20.000 | $ 50.000 |

---

## 3. Parámetros de subsidio por estrato

Los estratos 1, 2 y 3 reciben subsidio; los estratos 4, 5 y 6 pagan tarifa plena.

| Estrato | Subsidio | Ejemplo (tarifa $ 80.000) |
|---|---|---|
| 1 | 70 % | el ciudadano paga $ 24.000 |
| 2 | 40 % | el ciudadano paga $ 48.000 |
| 3 | 15 % | el ciudadano paga $ 68.000 |
| 4 | 0 % | el ciudadano paga $ 80.000 |
| 5 | 0 % | el ciudadano paga $ 80.000 |
| 6 | 0 % | el ciudadano paga $ 80.000 |

---

## 4. Cálculo de la tarifa

La tarifa final que paga el ciudadano se obtiene en dos pasos:

1. **Interpolación por peso.** A partir del peso declarado, se calcula la tarifa base entre el mínimo y el máximo del residuo.

   `tarifa_base = mín + (máx - mín) × (peso - peso_mín) / (peso_máx - peso_mín)`

2. **Aplicación del subsidio** según el estrato.

   `total_a_pagar = tarifa_base × (1 - subsidio_estrato)`

**Ejemplo (verificado en la aplicación):** un sofá de 55 kg, estrato 2.
Tarifa base = 60.000 + (160.000 − 60.000) × (55 − 40) / (70 − 40) = **$ 110.000**.
Con subsidio del 40 %: 110.000 × 0,60 = **$ 66.000**.

> Nota: los cambios en tarifas o subsidios se aplican a los reportes nuevos. Los reportes existentes conservan el subsidio del momento de su creación.

---

## 5. Entidades y campos

### 5.1 Usuario

Persona que accede a la plataforma. El inicio de sesión se realiza con Google.

| Campo | Tipo | Descripción |
|---|---|---|
| id | identificador | Identificador único del usuario. |
| nombre | texto | Nombre del usuario. |
| correo | texto | Correo electrónico (autenticación con Google). |
| rol | enum | `ciudadano`, `conductor`, `alcaldia`. |
| municipio | texto | Municipio del Valle de Aburrá. |
| estrato | entero (1 a 6) | Estrato del ciudadano, usado para el subsidio. |

### 5.2 Categoría

| Campo | Tipo | Descripción |
|---|---|---|
| id | identificador | Identificador de la categoría. |
| nombre | texto | Muebles, Camas y descanso, Electrodomésticos, Construcción y baño, Otros. |
| icono | texto | Ícono representativo. |

### 5.3 Residuo (catálogo)

| Campo | Tipo | Descripción |
|---|---|---|
| id | identificador | Identificador del residuo. |
| categoria_id | referencia | Categoría a la que pertenece. |
| nombre | texto | Nombre del residuo (Sofá, Nevera, etc.). |
| peso_min / peso_max | número (kg) | Rango de peso. |
| volumen_min / volumen_max | número (m³) | Rango de volumen. |
| tarifa_base_min / tarifa_base_max | número (COP) | Rango de tarifa base. |

### 5.4 Subsidio

| Campo | Tipo | Descripción |
|---|---|---|
| estrato | entero (1 a 6) | Estrato socioeconómico. |
| porcentaje | número (0 a 100) | Porcentaje de descuento sobre la tarifa base. |

### 5.5 Reporte

Solicitud de recolección creada por un ciudadano. Es la entidad central del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| id | identificador | Código del reporte (por ejemplo, `R1780846`). |
| ciudadano | referencia / texto | Usuario que crea el reporte. |
| residuo | referencia | Tipo de residuo seleccionado del catálogo. |
| peso_declarado | número (kg) | Peso aproximado indicado por el ciudadano. |
| estrato | entero (1 a 6) | Estrato usado para el subsidio. |
| tarifa_base | número (COP) | Tarifa interpolada por peso. |
| subsidio_aplicado | número (COP) | Descuento aplicado. |
| costo | número (COP) | Total a pagar por el ciudadano. |
| foto_url | texto | Foto del residuo (obligatoria). |
| municipio | texto | Municipio del Valle de Aburrá. |
| direccion | texto | Dirección textual del punto de recolección. |
| ubicacion | coordenadas | Latitud y longitud para el mapa. |
| estado | enum | `pendiente`, `asignado`, `recolectado`. |
| camion_id | referencia | Camión asignado (si aplica). |
| fecha_creacion | fecha y hora | Momento de creación del reporte. |

### 5.6 Camión

| Campo | Tipo | Descripción |
|---|---|---|
| id | identificador | Placa del camión (por ejemplo, `AMV-123`). |
| conductor | texto | Nombre del conductor. |
| capacidad_kg | número | Capacidad máxima de carga (5.000 kg en el MVP). |
| carga_actual_kg | número | Carga asignada en el momento. |
| utilizacion | porcentaje | Carga actual respecto a la capacidad. |
| estado | enum | `disponible`, `en_ruta` (y, en producción, `lleno` o `mantenimiento`). |
| ubicacion | coordenadas | Posición del camión en el mapa. |

**Camiones del MVP:** AMV-123 (Carlos Méndez), AMV-456 (Luisa Torres), AMV-789 (Pedro Ríos).

### 5.7 Ruta

| Campo | Tipo | Descripción |
|---|---|---|
| id | identificador | Identificador de la ruta. |
| camion_id | referencia | Camión que ejecuta la ruta. |
| reportes | lista de referencias | Reportes asignados, ordenados por cercanía. |
| estado | enum | Estado de la ruta. |

La ruta se genera con la función **Optimizar ruta** del panel del conductor, que ordena las paradas por cercanía (heurística del vecino más cercano) a partir de la posición del camión.

---

## 6. Estados del reporte

El reporte avanza por tres estados, que son visibles tanto para la alcaldía como para el conductor.

| Estado | Significado | Acción que lo origina |
|---|---|---|
| Pendiente | Reporte creado por el ciudadano, sin asignar. | El ciudadano envía la solicitud. |
| Asignado | Reporte aprobado y asignado a un camión. | La alcaldía aprueba o el conductor lo asigna. |
| Recolectado | Residuo recogido. | El conductor marca la recolección y la alcaldía confirma. |

Flujo: **Pendiente → (Aprobar / Asignar) → Asignado → (Confirmar / Recolectar) → Recolectado.**

---

## 7. Relaciones

- Un **usuario** con rol ciudadano crea muchos **reportes**.
- Un **reporte** referencia un **residuo** del catálogo y un **estrato** con su **subsidio**.
- Un **residuo** pertenece a una **categoría**.
- Un **camión** atiende muchos **reportes** a través de una **ruta**.
- Una **ruta** agrupa varios **reportes** cercanos para un mismo camión.

```
Categoría 1 ───< Residuo 1 ───< Reporte >─── 1 Estrato (Subsidio)
                                   │
                                   └──< Ruta >── 1 Camión
```

---

## 8. Cobertura geográfica

La zona piloto es el Área Metropolitana del Valle de Aburrá, con municipios como Medellín, Bello, Envigado, Itagüí, Sabaneta, La Estrella, Caldas, Copacabana, Girardota y Barbosa. Los reportes y los camiones se representan sobre un mapa de Leaflet con OpenStreetMap, dentro del polígono del área metropolitana.

---

*Modelo de datos basado en la aplicación EcoClean Connect (versión base / MVP). Equipo 35 · Hackathon Beca Ser ANDI 2026 · EAFIT.*
