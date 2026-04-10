'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const PROS = [
  { lat: 3.389, lng: -76.542, ini: 'JM', color: '#EF9F27', name: 'Jorge Murillo',  spec: 'Cerrajero',      rating: '4.9' },
  { lat: 3.402, lng: -76.535, ini: 'LV', color: '#1D9E75', name: 'Luz Vargas',     spec: 'Electricista',   rating: '4.6' },
  { lat: 3.395, lng: -76.528, ini: 'CR', color: '#1D9E75', name: 'Carlos Ramos',   spec: 'Cerrajero',      rating: '4.5' },
  { lat: 3.412, lng: -76.548, ini: 'AG', color: '#EF9F27', name: 'Ana Gómez',      spec: 'Plomera',        rating: '4.8' },
  { lat: 3.378, lng: -76.539, ini: 'PS', color: '#1D9E75', name: 'Pedro Salcedo',  spec: 'Pintor',         rating: '4.7' },
  { lat: 3.385, lng: -76.555, ini: 'RP', color: '#D85A30', name: 'Raúl Pinto',     spec: 'Plomero · Urgente', rating: '4.9' },
  { lat: 3.415, lng: -76.542, ini: 'SM', color: '#EF9F27', name: 'Sandra Mejía',   spec: 'Aire Acond.',    rating: '4.8' },
]

const SOLICITUDES = [
  { lat: 3.391, lng: -76.540, icon: '🔑', label: 'Cerrajería',  precio: '$50k–$150k' },
  { lat: 3.405, lng: -76.533, icon: '⚡',  label: 'Electricidad', precio: '$80k–$200k' },
  { lat: 3.397, lng: -76.552, icon: '🔧', label: 'Plomería',    precio: 'Hasta $100k' },
  { lat: 3.382, lng: -76.545, icon: '🎨', label: 'Pintura',     precio: '$90k/día' },
  { lat: 3.418, lng: -76.530, icon: '❄️', label: 'Aire Acond.', precio: '$120k–$300k' },
  { lat: 3.375, lng: -76.558, icon: '🪚', label: 'Carpintería', precio: '$60k' },
]

function makeProIcon(color: string, ini: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};border:2.5px solid #fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-size:10px;font-weight:500;color:#fff">${ini}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function makeSolIcon(icon: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#fff;border:1.5px solid #1D9E75;border-radius:10px;padding:3px 7px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:11px;white-space:nowrap;color:#085041;font-weight:500">${icon} ${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export default function LandingMapClient({ tipo }: { tipo: 'cliente' | 'profesional' }) {
  const center: [number, number] = [3.3950, -76.5370]

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: 240, width: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />
      {tipo === 'cliente'
        ? PROS.map((p) => (
            <Marker key={p.ini} position={[p.lat, p.lng]} icon={makeProIcon(p.color, p.ini)}>
              <Popup>
                <b style={{ fontSize: 13 }}>{p.name}</b><br />
                <span style={{ fontSize: 11, color: '#666' }}>{p.spec}</span><br />
                <span style={{ fontSize: 11, color: '#BA7517' }}>★ {p.rating}</span>
              </Popup>
            </Marker>
          ))
        : SOLICITUDES.map((s) => (
            <Marker key={s.label} position={[s.lat, s.lng]} icon={makeSolIcon(s.icon, s.label)}>
              <Popup>
                <b>{s.icon} {s.label}</b><br />
                <span style={{ fontSize: 11, color: '#1D9E75' }}>{s.precio}</span>
              </Popup>
            </Marker>
          ))
      }
    </MapContainer>
  )
}
