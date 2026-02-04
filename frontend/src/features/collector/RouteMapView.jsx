import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle, Trash2, MapPin } from 'lucide-react';

// Fix for default marker icons validation 
// (Leaflet's default icon paths often break in bundlers)
// const iconBase = 'https://unpkg.com/leaflet@1.7.1/dist/images/'; // This variable is no longer needed

// Custom DivIcon for better visuals logic
const createCustomIcon = (type, isOverflow, sequence) => {
    // Simple robust HTML string generation to avoid react-dom/server issues
    const borderColor = isOverflow ? 'border-red-500' : 'border-emerald-500';
    const bgColor = isOverflow ? 'bg-red-50' : 'bg-emerald-50';
    const textColor = isOverflow ? 'text-red-700' : 'text-emerald-700';

    const iconHtml = `
    <div class="relative w-8 h-8 rounded-full border-2 ${borderColor} ${bgColor} flex items-center justify-center shadow-md z-10">
      <span class="${textColor} font-bold text-sm">${sequence}</span>
      ${isOverflow ?
            `<span class="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">!</span>`
            : ''}
    </div>
    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 -z-0 opacity-20"></div>
  `;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
    });
};

// Component to fit bounds
const ChangeView = ({ bounds }) => {
    const map = useMap();
    React.useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

const RouteMapView = ({ route = [] }) => {
    // Filter out items without location
    const validStops = useMemo(() => {
        return route.filter(p => p.location && p.location.lat && p.location.lng);
    }, [route]);

    const polylinePositions = useMemo(() => {
        return validStops.map(p => [p.location.lat, p.location.lng]);
    }, [validStops]);

    const center = validStops.length > 0
        ? [validStops[0].location.lat, validStops[0].location.lng]
        : [26.1158, 91.7086]; // Default to Guwahati if empty

    if (!route.length) {
        return (
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                <div className="text-center">
                    <MapPin size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No route data available to map.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Draw Line */}
                <Polyline
                    positions={polylinePositions}
                    pathOptions={{ color: '#0ea5e9', weight: 4, dashArray: '10, 10', opacity: 0.6 }}
                />

                {/* Draw Markers */}
                {validStops.map((stop, idx) => (
                    <Marker
                        key={stop.pickupId || stop._id}
                        position={[stop.location.lat, stop.location.lng]}
                        icon={createCustomIcon(stop.wasteType, stop.overflow, stop.sequence || idx + 1)}
                    >
                        <Popup>
                            <div className="min-w-[150px]">
                                <p className="font-bold text-slate-800 text-sm mb-1">
                                    Stop #{stop.sequence || idx + 1}
                                </p>
                                <div className="text-xs text-slate-600 space-y-1">
                                    <p>Ward: {stop.wardNumber}</p>
                                    <p className="capitalize">Type: <span className="font-medium">{stop.wasteType}</span></p>
                                    {stop.overflow && <p className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle size={12} /> Overflow</p>}
                                    <p className="text-[10px] text-slate-400 mt-1">{stop.houseNumber}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ChangeView bounds={polylinePositions} />
            </MapContainer>
        </div>
    );
};

export default RouteMapView;
