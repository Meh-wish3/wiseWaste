import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createPickup, fetchIncentives } from './CitizenApi';
import { Droplets, Trash2, Battery, AlertTriangle, Clock, MapPin, CheckCircle2, Ticket, Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const wasteTypeOptions = [
  {
    value: 'wet',
    label: 'Wet Waste',
    desc: 'Kitchen & Organic',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <Droplets size={24} />
  },
  {
    value: 'dry',
    label: 'Dry Waste',
    desc: 'Plastic, Paper, Metal',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Trash2 size={24} />
  },
  {
    value: 'e-waste',
    label: 'E-Waste',
    desc: 'Batteries, Electronics',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Battery size={24} />
  },
];

const CitizenPickupForm = () => {
  const { user } = useAuth();
  const [wasteType, setWasteType] = useState('wet');
  const [pickupTime, setPickupTime] = useState('');
  const [overflow, setOverflow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(0);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  // Fetch user's incentive points on mount
  useEffect(() => {
    if (user) {
      fetchIncentives('me')
        .then((data) => setPoints(data.points || 0))
        .catch(() => { });
    }
  }, [user]);

  // Request geolocation on component mount
  useEffect(() => {
    if (!user) return;

    if ('geolocation' in navigator) {
      setLocationStatus('requesting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus('granted');
        },
        (error) => {
          console.warn('Geolocation denied or failed:', error);
          setLocationStatus('denied');
          // Fallback: use user's registered location if available
          if (user.location?.lat && user.location?.lng) {
            setLocation(user.location);
            setLocationStatus('fallback');
          }
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setLocationStatus('denied');
      if (user.location?.lat && user.location?.lng) {
        setLocation(user.location);
        setLocationStatus('fallback');
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupTime) return;
    setSubmitting(true);
    setMessage('');
    try {
      await createPickup({
        wasteType,
        pickupTime,
        overflow,
        location,
      });

      // Refresh points
      fetchIncentives('me')
        .then((data) => setPoints(data.points || 0))
        .catch(() => { });

      setMessage('Pickup scheduled successfully! Location shared with collector.');
      setPickupTime('');
      setOverflow(false);
    } catch (err) {
      setMessage('Failed to schedule pickup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3 items-start animate-fade-in-up">
      {/* Form Section */}
      <section className="card lg:col-span-2 shadow-xl shadow-slate-200/50 border-0 ring-1 ring-slate-100 bg-white/80 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400" />

        <div className="mb-6">
          <h2 className="font-heading text-xl font-bold text-slate-800 flex items-center gap-2">
            Schedule a Pickup
          </h2>
          <p className="text-sm text-slate-500">
            Select waste type and time. Ward workers will arrive at your location.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Waste Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Step 1: Select Waste Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {wasteTypeOptions.map((opt) => {
                const isSelected = wasteType === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setWasteType(opt.value)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col gap-3 group ${isSelected
                      ? `border-primary/50 ring-2 ring-primary/20 bg-primary/5`
                      : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-md'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                      {isSelected ? <CheckCircle2 size={20} /> : opt.icon}
                    </div>
                    <div>
                      <p className={`font-bold text-sm mb-0.5 ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Time & Overflow */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Step 2: Time & Urgency
            </label>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bin Status
                </label>
                <div
                  className={`rounded-xl border p-3 cursor-pointer transition-all duration-200 flex items-center gap-3 h-[46px] ${overflow
                    ? 'border-red-200 bg-red-50 text-red-900 ring-4 ring-red-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  onClick={() => setOverflow(!overflow)}
                >
                  <div className={`p-1 rounded-full ${overflow ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <AlertTriangle size={14} />
                  </div>
                  <span className={`text-sm font-bold ${overflow ? 'text-red-700' : 'text-slate-600'}`}>
                    {overflow ? 'Overflow Reported (High Priority)' : 'Standard Fill Level'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Bar */}
          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${locationStatus === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {locationStatus === 'granted' ? (
                <span>GPS Location Acquired</span>
              ) : locationStatus === 'requesting' ? (
                <span>Acquiring GPS...</span>
              ) : (
                <span>Using Registered Address</span>
              )}
            </div>
            {location && (
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !pickupTime}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw size={20} className="animate-spin" /> Scheduling...
              </span>
            ) : 'Confirm Pickup Request'}
          </button>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${message.includes('success')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-red-50 text-red-800 border border-red-100'
                }`}
            >
              {message.includes('success') ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-red-600" />}
              {message}
            </motion.div>
          )}
        </form>
      </section>

      {/* Sidebar / Score Card */}
      <section className="space-y-6">
        {/* Eco Card */}
        <div className="card bg-slate-900 text-white shadow-2xl border-none relative overflow-hidden min-h-[220px] flex flex-col justify-between group">
          {/* Card Background Effects */}
          <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-700">
            <Ticket size={180} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/50 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />

          {/* Card Header */}
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">Eco-Credits</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-mono font-bold tracking-tighter text-white text-shadow-lg">{points}</span>
                <span className="text-sm text-slate-400">pts</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 opacity-80" />
            </div>
          </div>

          {/* Card Chip */}
          <div className="relative z-10 w-10 h-8 rounded bg-gradient-to-br from-amber-200 to-amber-100 border border-amber-300 shadow-inner opacity-80" />

          {/* Card Footer */}
          <div className="relative z-10">
            <p className="font-mono text-xs text-slate-400 tracking-widest mb-4">**** **** **** {user?.houseNumber?.slice(0, 4) || '0000'}</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] text-slate-500 uppercase">Card Holder</p>
                <p className="text-sm font-medium tracking-wide text-slate-200">{user?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase">Cluster</p>
                <p className="text-xs font-bold text-emerald-400">WARD-{user?.wardNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Ticket size={16} className="text-emerald-500" /> Earning Rules
          </h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="flex items-center gap-2"><Droplets size={12} className="text-emerald-500" /> Wet Waste</span>
              <span className="font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">+5 pts</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="flex items-center gap-2"><Trash2 size={12} className="text-blue-500" /> Dry Waste</span>
              <span className="font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">+8 pts</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="flex items-center gap-2"><Battery size={12} className="text-amber-500" /> E-Waste</span>
              <span className="font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">+15 pts</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default CitizenPickupForm;
