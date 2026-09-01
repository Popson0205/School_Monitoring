import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { api, Institution } from '../lib/api';

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getInstitutions().then(setInstitutions).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      // Free demo-tiles style; swap for a self-hosted style/tile server before production,
      // especially for government deployments with map-provider restrictions.
      style: 'https://demotiles.maplibre.org/style.json',
      center: [7.4951, 9.0579],
      zoom: 10,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (!mapRef.current || institutions.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    institutions.forEach((inst) => {
      const marker = new maplibregl.Marker({ color: '#0f172a' })
        .setLngLat([inst.lng, inst.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 24 }).setHTML(
            `<strong>${inst.name}</strong><br/>${inst.type} · ${inst.ownership}`,
          ),
        )
        .addTo(mapRef.current!);
      bounds.extend([inst.lng, inst.lat]);
      return marker;
    });

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 13 });
    }
  }, [institutions]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Institution Map</h1>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      <div ref={mapContainer} style={{ height: '75vh', borderRadius: 10, overflow: 'hidden' }} />
    </div>
  );
}
