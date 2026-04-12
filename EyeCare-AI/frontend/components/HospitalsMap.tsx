'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { Hospital } from '@/lib/types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

interface Props {
  hospitals: Hospital[];
  selectedHospital?: Hospital | null;
  center?: LatLngExpression;
  zoom?: number;
}

// Inner component that can access the map instance to fly to a location
function FlyToHospital({ hospital }: { hospital: Hospital | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (hospital?.location) {
      map.flyTo(
        [hospital.location.latitude, hospital.location.longitude],
        15,
        { duration: 1.2 }
      );
    }
  }, [hospital, map]);

  return null;
}

export function HospitalsMap({ hospitals, selectedHospital, center, zoom = 12 }: Props) {
  const defaultCenter: LatLngExpression =
    center ||
    (hospitals[0]
      ? [hospitals[0].location.latitude, hospitals[0].location.longitude]
      : [23.8103, 90.4125]); // Dhaka fallback

  return (
    <div className="h-[480px] w-full rounded-lg border overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Fly to selected hospital */}
        <FlyToHospital hospital={selectedHospital} />

        {hospitals.map(h => (
          <Marker
            key={h._id}
            position={[h.location.latitude, h.location.longitude]}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{h.name}</p>
                <p className="text-xs text-gray-700">{h.address.street}</p>
                {h.contactPhone && (
                  <p className="text-xs text-gray-700">Phone: {h.contactPhone}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
