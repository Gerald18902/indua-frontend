import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const VerMapaModal = ({ idRuta, onClose }) => {
  const [ruta, setRuta] = useState(null);

  useEffect(() => {
    if (idRuta) {
      axios.get(`http://localhost:8080/api/rutas/mapa-ruta/${idRuta}`)
        .then(res => setRuta(res.data))
        .catch(err => {
          console.error('Error al cargar ruta:', err);
          setRuta(null);
        });
    }
  }, [idRuta]);

  if (!idRuta || !ruta) return null;

  const puntos = ruta.locales
    .filter(loc => loc.latitud && loc.longitud)
    .map(loc => [loc.latitud, loc.longitud]);

  const centro = puntos.length > 0 ? puntos[0] : [-8.115, -79.028]; // Coordenada por defecto (Trujillo)

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 text-black dark:text-white transition-colors rounded-xl p-4 w-[95%] max-w-4xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-2xl font-bold text-black dark:text-white hover:text-red-600"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-center mb-2">Mapa de la Ruta</h2>
        <p className="text-sm text-center text-gray-700 dark:text-gray-300 mb-4">
          Unidad: <strong>{ruta.placa}</strong> {ruta.comentario && `– ${ruta.comentario}`}
        </p>

        <MapContainer
          center={centro}
          zoom={13}
          style={{ height: '500px', width: '100%', borderRadius: '0.75rem' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {puntos.map((pos, i) => (
            <Marker key={i} position={pos}>
              <Popup>
                {i + 1}. {ruta.locales[i].nombre} ({ruta.locales[i].codigo})
              </Popup>
            </Marker>
          ))}
          <Polyline positions={puntos} color="blue" />
        </MapContainer>
      </div>
    </div>
  );
};

export default VerMapaModal;
