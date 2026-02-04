import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Mail, Lock, MapPin, Home, Building2, Loader2, ArrowRight, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userType, setUserType] = useState('CITIZEN'); // CITIZEN | COLLECTOR
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        // Citizen fields
        houseNumber: '',
        wardNumber: '4',
        area: '',
        location: null,
        // Collector fields - uses same wardNumber
    });

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setError('Could not get your location. You can skip this step.');
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: userType,
                wardNumber: formData.wardNumber,
            };

            // Add citizen-specific fields
            if (userType === 'CITIZEN') {
                userData.houseNumber = formData.houseNumber;
                userData.area = formData.area;
                userData.location = formData.location;
            }

            const user = await register(userData);

            // Redirect based on role
            switch (user.role) {
                case 'CITIZEN':
                    navigate('/citizen');
                    break;
                case 'COLLECTOR':
                    navigate('/collector');
                    break;
                case 'ADMIN':
                    navigate('/admin');
                    break;
                default:
                    navigate('/');
            }
        } catch (err) {
            setError(err || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary/20 to-lime-100/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-100/40 to-primary/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                            <Leaf size={24} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">Create Account</h1>
                    <p className="text-slate-500">Join the ward-level waste management system</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-glass p-8 border border-white/50">
                    {/* User Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8 relative">
                        <div className={`absolute inset-y-1 w-1/2 bg-white shadow-sm rounded-lg transition-all duration-300 ${userType === 'COLLECTOR' ? 'left-1/2 translate-x-0' : 'left-0'}`} />
                        <button
                            type="button"
                            onClick={() => setUserType('CITIZEN')}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors ${userType === 'CITIZEN' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Citizen
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('COLLECTOR')}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-semibold transition-colors ${userType === 'COLLECTOR' ? 'text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Collector
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Ward Number</label>
                                <div className="relative">
                                    <select
                                        className="input-field pl-10 appearance-none"
                                        value={formData.wardNumber}
                                        onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                                        required
                                    >
                                        <option value="1">Ward 1</option>
                                        <option value="2">Ward 2</option>
                                        <option value="3">Ward 3</option>
                                        <option value="4">Ward 4</option>
                                        <option value="5">Ward 5</option>
                                        <option value="6">Ward 6</option>
                                        <option value="7">Ward 7</option>
                                        <option value="8">Ward 8</option>
                                        <option value="9">Ward 9</option>
                                        <option value="10">Ward 10</option>
                                    </select>
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Citizen-specific fields */}
                        {userType === 'CITIZEN' && (
                            <>
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">House Number *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="input-field pl-10"
                                                placeholder="H001 or A-123"
                                                value={formData.houseNumber}
                                                onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                                                required
                                            />
                                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Area (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="input-field pl-10"
                                                placeholder="e.g., Bhetapara - Lane 1"
                                                value={formData.area}
                                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                            />
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Location (Optional)</label>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="btn-outline w-full sm:w-auto"
                                    >
                                        <Navigation size={16} />
                                        {formData.location ? 'Location Captured ✓' : 'Get Current Location'}
                                    </button>
                                    {formData.location && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Lat: {formData.location.lat.toFixed(4)}, Lng: {formData.location.lng.toFixed(4)}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    className="input-field pl-10"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="input-field pl-10"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full h-12 text-base justify-center group"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-emerald-700">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
