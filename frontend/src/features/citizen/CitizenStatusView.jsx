import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCitizenPickups, fetchIncentives, cancelPickupRequest } from './CitizenApi';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Droplets, Trash2, Battery, AlertTriangle, MapPin, ChevronDown, Clock, FileText, Ban, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const wasteIcons = {
  wet: <Droplets size={16} className="text-emerald-500" />,
  dry: <Trash2 size={16} className="text-blue-500" />,
  'e-waste': <Battery size={16} className="text-amber-500" />,
};

const CitizenStatusView = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [points, setPoints] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [pickupsData, incentivesData] = await Promise.all([
        fetchCitizenPickups(),
        fetchIncentives('me')
      ]);
      setPickups(pickupsData);
      setPoints(incentivesData.points || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadData();
    const interval = setInterval(loadData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) return;
    try {
      await cancelPickupRequest(id);
      loadData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to cancel pickup. Please try again.');
    }
  };

  return (
    <section className="mt-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div>
          <h3 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
            Pickup History
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {pickups.length}
            </span>
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Track the status of your collection requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
            title="Refresh status"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider opacity-70">Total Score</span>
              {points} pts
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {pickups.map((p) => {
            const isExpanded = expandedId === p._id;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={p._id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isExpanded
                  ? 'shadow-lg border-primary/20 ring-1 ring-primary/10'
                  : 'border-slate-100 shadow-sm hover:border-slate-300'
                  }`}
              >
                {/* Card Header (Clickable) */}
                <div
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer relative"
                  onClick={() => toggleExpand(p._id)}
                >
                  {/* Visual Accent Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.status === 'completed' ? 'bg-emerald-500' : p.status === 'assigned' ? 'bg-blue-500' : 'bg-slate-300'
                    }`} />

                  <div className="flex items-center gap-4 pl-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br border shadow-sm transition-transform group-hover:scale-105 ${p.wasteType === 'wet' ? 'from-emerald-50 to-emerald-100/50 border-emerald-100' :
                      p.wasteType === 'dry' ? 'from-blue-50 to-blue-100/50 border-blue-100' :
                        'from-amber-50 to-amber-100/50 border-amber-100'
                      }`}>
                      {wasteIcons[p.wasteType]}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-800 capitalize text-base">
                          {p.wasteType} Waste
                        </span>
                        {p.overflow && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                            Overflow
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(p.pickupTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        {new Date(p.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pl-16 sm:pl-0">
                    <div className="text-right">
                      <StatusBadge status={p.status} />
                    </div>

                    <button
                      className={`text-slate-300 transition-transform duration-300 p-1 rounded-full hover:bg-slate-50 ${isExpanded ? 'rotate-180 text-primary' : 'hover:text-primary'}`}
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/30"
                    >
                      <div className="p-5 grid sm:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><FileText size={12} /> Request ID</p>
                            <p className="font-mono text-slate-600 bg-white border border-slate-200 inline-block px-2 py-0.5 rounded text-xs select-all">{p._id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5"><Clock size={12} /> Status Detail</p>
                            <p className="text-slate-700 font-medium leading-relaxed">
                              {p.status === 'completed' ? (
                                <span className="flex items-center gap-2 text-emerald-600">
                                  Pickup completed by collector.
                                  {p.segregationVerified ? ' Segregation verified (+Points).' : ' Segregation pending.'}
                                </span>
                              ) : p.status === 'assigned' ? (
                                'Collector is on the way. Please keep bins ready.'
                              ) : (
                                'Waiting for collector assignment. Usually processed within 2 hours.'
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-end items-end gap-2 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                          {p.status === 'pending' && (
                            <div className="text-right">
                              <button
                                onClick={() => handleCancel(p._id)}
                                className="text-xs font-semibold text-red-600 flex items-center gap-1 border border-red-200 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
                              >
                                <Ban size={14} /> Cancel Request
                              </button>
                              <p className="text-[10px] text-slate-400 mt-1.5">Free cancellation before assignment.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!pickups.length && !refreshing && (
          <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200/60">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Calendar size={32} />
            </div>
            <h4 className="text-slate-900 font-bold mb-1">No pickups scheduled</h4>
            <p className="text-slate-500 text-sm">
              Use the form above to schedule your first pickup.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};


export default CitizenStatusView;
