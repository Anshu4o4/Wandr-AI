import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * TripMap Component
 * Lazily loaded to keep initial bundle size small (~200KB Leaflet library)
 * Only loads when user clicks the Map tab
 */
export default function TripMap({ trip }) {
  return (
    <div className="animate-fadeIn h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200">
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            {trip?.title} <br /> {trip?.destination}
          </Popup>
        </Marker>
      </MapContainer>
      <p className="p-4 bg-slate-50 text-xs text-slate-500 text-center italic">
        Map centered on default coordinates. Real-time geocoding available in production.
      </p>
    </div>
  );
}
