import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import { WASTE_CATALOG, VALLE_CENTER, VALLE_POLYGON, fmt, statusLabel, statusColor } from './data.js';

export default function LeafletMap({ reports, trucks, onReportClick, optimizedRoute, center, showBoundary = true }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    if (leafletMap.current) return;
    leafletMap.current = L.map(mapRef.current, { center: center || VALLE_CENTER, zoom: 11 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(leafletMap.current);
    if (showBoundary) {
      L.polygon(VALLE_POLYGON, { color: '#059669', weight: 2, fillColor: '#10b981', fillOpacity: 0.06, dashArray: '6 5' })
        .addTo(leafletMap.current)
        .bindPopup('<b>Área de servicio</b><br>Área Metropolitana del Valle de Aburrá');
    }
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;
    layersRef.current.forEach(m => m.remove());
    layersRef.current = [];

    const route = optimizedRoute || reports || [];
    route.forEach((r, idx) => {
      const color = statusColor[r.estado] || '#888';
      const num = optimizedRoute ? idx + 1 : '';
      const icon = L.divIcon({
        html: `<div style="background:${color};color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${num || '●'}</div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 14],
      });
      const waste = WASTE_CATALOG.find(w => w.id === r.tipo);
      const m = L.marker([r.lat, r.lng], { icon }).addTo(leafletMap.current)
        .bindPopup(`<b>${waste?.icon || ''} ${waste?.label || ''}</b><br>${r.direccion}<br><span style="color:${color};font-weight:600">${statusLabel[r.estado]}</span><br>Costo: ${fmt(r.costo_final)}`);
      if (onReportClick) m.on('click', () => onReportClick(r));
      layersRef.current.push(m);
    });

    (trucks || []).forEach(t => {
      const icon = L.divIcon({
        html: `<div style="background:#1d4ed8;color:#fff;border-radius:6px;padding:2px 6px;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🚛 ${t.plate}</div>`,
        className: '',
      });
      const m = L.marker([t.lat, t.lng], { icon }).addTo(leafletMap.current)
        .bindPopup(`<b>Camión ${t.plate}</b><br>${t.driver}<br>${t.status}`);
      layersRef.current.push(m);
    });

    if (optimizedRoute && optimizedRoute.length > 1) {
      const latlngs = optimizedRoute.map(r => [r.lat, r.lng]);
      const poly = L.polyline(latlngs, { color: '#3b82f6', weight: 3, dashArray: '8 4' }).addTo(leafletMap.current);
      layersRef.current.push(poly);
    }
  }, [reports, trucks, optimizedRoute]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 12, zIndex: 0 }} />;
}
