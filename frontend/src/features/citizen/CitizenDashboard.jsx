import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import CitizenPickupForm from './CitizenPickupForm';
import CitizenStatusView from './CitizenStatusView';

const CitizenDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50/50 relative font-sans text-slate-900">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-200">
                            W
                        </div>
                        <span className="text-lg font-heading font-bold text-slate-800 tracking-tight">
                            Waste<span className="text-primary">Wise</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right mr-2">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                {user?.name}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                Ward {user?.wardNumber} • House {user?.houseNumber}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                        <button
                            onClick={handleLogout}
                            className="group relative p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            title="Logout"
                        >
                            <LogOut size={20} className="transition-transform group-hover:-translate-x-0.5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 tracking-tight mb-2">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl">
                        Ready to make a difference today? Schedule a pickup or check your recycling impact below.
                    </p>
                </div>

                <div className="grid gap-8">
                    <CitizenPickupForm />
                    <CitizenStatusView />
                </div>
            </main>
        </div>
    );
};

export default CitizenDashboard;
