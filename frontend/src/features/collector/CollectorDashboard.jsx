import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  fetchShiftPickups,
  generateRoute,
  verifySegregation,
  completePickup,
} from './CollectorApi';
import StatusBadge from '../../components/StatusBadge';
import RouteView from './RouteView';
import CollectorStats from './CollectorStats';
import { LayoutList, Map as MapIcon, Navigation, CheckCircle2, AlertOctagon, RotateCcw, Box, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const CollectorDashboard = () => {
  const [pickups, setPickups] = useState([]);
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

  const routeRef = useRef(null);

  const refreshPickups = () => {
    fetchShiftPickups().then(setPickups).catch(err => console.error(err));
  };

  useEffect(() => {
    refreshPickups();
  }, []);

  // Group pickups by area
  const groupedPickups = useMemo(() => {
    const groups = {};
    pickups.forEach((p) => {
      const area = p.area || 'Unknown';
      if (!groups[area]) {
        groups[area] = [];
      }
      groups[area].push(p);
    });
    return groups;
  }, [pickups]);

  const handleGenerateRoute = async () => {
    setLoadingRoute(true);
    try {
      const data = await generateRoute();
      setRoute(data);
      // Auto-scroll to map visualization
      setTimeout(() => {
        routeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleVerifySegregation = async (pickupId, verified, verificationStatus) => {
    setVerifyingId(pickupId);
    try {
      await verifySegregation(pickupId, { verified, verificationStatus });
      refreshPickups();
    } finally {
      setVerifyingId(null);
    }
  };

  const handleComplete = async (pickupId) => {
    if (!window.confirm('Mark this pickup as completed? Points will be awarded only if segregation was verified.')) {
      return;
    }
    setCompletingId(pickupId);
    try {
      await completePickup(pickupId);
      refreshPickups();
      if (route) {
        handleGenerateRoute();
      }
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Overview */}
      <CollectorStats pickups={pickups} />

      {/* Main Control Headers */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-slate-800 flex items-center gap-2">
              Pickup Queue
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{pickups.length}</span>
            </h2>
            <p className="text-sm text-slate-500">Manage daily collection tasks and verify segregation.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
              <button
                onClick={() => setViewMode('grouped')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'grouped' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Box size={14} /> By Area
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <LayoutList size={14} /> List View
              </button>
            </div>

            <button
              onClick={refreshPickups}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm"
              title="Refresh List"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={handleGenerateRoute}
              disabled={loadingRoute}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Navigation size={18} className={loadingRoute ? 'animate-spin' : ''} />
              {loadingRoute ? 'Optimizing...' : 'Generate Route'}
            </button>
          </div>
        </div>

        {/* Content View */}
        {viewMode === 'grouped' ? (
          <div className="grid gap-6">
            {Object.keys(groupedPickups).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <Box size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No active pickups found.</p>
                <p className="text-xs text-slate-400 mt-1">Check back later or refresh.</p>
              </div>
            ) : (
              Object.entries(groupedPickups).map(([area, areaPickups]) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={area}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                      <MapPin size={16} className="text-primary" /> {area}
                    </h3>
                    <span className="text-xs font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
                      {areaPickups.length} tasks
                    </span>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {areaPickups.map((p) => (
                      <div key={p._id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left Info */}
                          <div className="flex gap-4 items-start">
                            {/* Icon Box */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${p.wasteType === 'wet' ? 'bg-emerald-100 text-emerald-600' :
                                p.wasteType === 'dry' ? 'bg-blue-100 text-blue-600' :
                                  'bg-amber-100 text-amber-600'
                              }`}>
                              <span className="font-bold text-xs uppercase">{p.wasteType[0]}</span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-800 text-sm">HH-{p.householdId}</span>
                                {p.overflow && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-1"><AlertOctagon size={10} /> OVERFLOW</span>}
                                <StatusBadge status={p.status} />
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="capitalize font-medium text-slate-700">{p.wasteType} Waste</span> • {new Date(p.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>

                          {/* Right Actions */}
                          <div className="flex flex-wrap items-center gap-2 justify-end">
                            {p.status !== 'completed' && (
                              <>
                                {/* Verification Buttons */}
                                {p.overflow && (!p.verificationStatus || p.verificationStatus === 'pending') && (
                                  <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                                    <button onClick={() => handleVerifySegregation(p._id, true, 'verified')} disabled={verifyingId === p._id} className="p-1.5 hover:bg-emerald-100 hover:text-emerald-700 rounded text-slate-500 transition-colors" title="Confirm Overflow">
                                      <CheckCircle2 size={16} />
                                    </button>
                                    <button onClick={() => handleVerifySegregation(p._id, true, 'false_alarm')} disabled={verifyingId === p._id} className="p-1.5 hover:bg-red-100 hover:text-red-700 rounded text-slate-500 transition-colors" title="False Alarm">
                                      <AlertOctagon size={16} />
                                    </button>
                                  </div>
                                )}

                                {!p.segregationVerified ? (
                                  <button
                                    onClick={() => handleVerifySegregation(p._id, true)}
                                    disabled={verifyingId === p._id}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                  >
                                    {verifyingId === p._id ? '...' : 'Verify Segregation'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleVerifySegregation(p._id, false)}
                                    disabled={verifyingId === p._id}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white border border-emerald-600 text-xs font-bold shadow-sm flex items-center gap-1"
                                  >
                                    <CheckCircle2 size={12} /> Verified
                                  </button>
                                )}

                                <button
                                  onClick={() => handleComplete(p._id)}
                                  disabled={completingId === p._id}
                                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 shadow-lg shadow-slate-200 transition-all disabled:opacity-50"
                                >
                                  {completingId === p._id ? 'Completing...' : 'Complete Job'}
                                </button>
                              </>
                            )}
                            {p.status === 'completed' && (
                              <span className="flex items-center gap-1 text-slate-400 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <CheckCircle2 size={14} /> Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pickups.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      HH-{p.householdId}
                      {p.overflow && <span className="block text-[10px] text-red-600 font-bold mt-0.5">OVERFLOW</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.area || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`capitalize px-2 py-0.5 rounded text-[10px] font-bold ${p.wasteType === 'wet' ? 'bg-emerald-100 text-emerald-700' :
                          p.wasteType === 'dry' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {p.wasteType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status !== 'completed' ? (
                        <button onClick={() => handleComplete(p._id)} className="text-primary font-bold hover:underline">Complete</button>
                      ) : <span className="text-slate-400">Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pickups.length && <p className="text-center py-8 text-slate-400">No data available.</p>}
          </div>
        )}
      </section>

      {/* Route Visualization */}
      {route && (
        <section ref={routeRef} className="mt-8 border-t border-slate-200 pt-8 animate-fade-in-up">
          <RouteView routeData={route} />
        </section>
      )}
    </div>
  );
};

export default CollectorDashboard;
