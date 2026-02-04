import React, { useState } from 'react';
import routingExplanation from '../../utils/routingExplanation';
import RouteMapView from './RouteMapView';
import { Map, List } from 'lucide-react';

const RouteView = ({ routeData }) => {
  const { meta, route } = routeData;
  const [showMap, setShowMap] = useState(true);

  return (
    <section className="card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-primary">
            Optimized Route Plan
          </h3>
          <p className="text-[11px] text-slate-500 max-w-md">
            Follow this sequence for the most efficient collection path.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setShowMap(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!showMap ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setShowMap(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${showMap ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Map size={14} /> Map View
            </button>
          </div>
        </div>
      </div>

      {showMap ? (
        <RouteMapView route={route} />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            {route.map((step) => (
              <div
                key={step.pickupId || step.sequence}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 hover:border-emerald-100 transition-colors"
              >
                <div className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold shadow-soft ${step.overflow ? 'bg-red-100 text-red-700' : 'bg-secondary text-primary'}`}>
                  {step.sequence}
                </div>
                <div className="text-[11px] flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800">
                      HH {step.householdId || step.houseNumber} – {step.area}
                    </p>
                    {step.overflow && (
                      <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-100">
                        Overflow
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    Waste: <span className="capitalize font-medium">{step.wasteType}</span>{' '}
                    <span className="text-slate-300 mx-1">|</span> Time: {new Date(step.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="mt-1 text-slate-500 italic">{step.explanation}</p>
                </div>
              </div>
            ))}
            {!route.length && (
              <p className="text-[11px] text-slate-400">
                No pending pickups. Once citizens raise requests, generate the
                route to see the ordered list here.
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4 text-[11px] text-emerald-900 h-fit">
            <p className="font-semibold mb-2 text-emerald-800">Routing Logic</p>
            <p className="mb-3 text-slate-600 leading-relaxed">{routingExplanation}</p>

            <div className="bg-white/60 rounded-lg p-2 border border-emerald-100/50">
              <p className="font-semibold mb-1 text-emerald-800">Ward Order</p>
              <p className="text-xs">{meta?.areaOrder?.join(' → ') || 'Standard Ward Loop'}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RouteView;

