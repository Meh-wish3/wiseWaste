import React from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, subtext, progress }) => (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className={`absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform ${color.text}`}>
            <Icon size={48} />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${color.bg} ${color.text}`}>
                    <Icon size={16} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>

            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">{value}</span>
                {subtext && <span className="text-[10px] text-slate-400 font-medium">{subtext}</span>}
            </div>

            {progress !== undefined && (
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    </div>
);

const CollectorStats = ({ pickups }) => {
    const total = pickups.length;
    const completed = pickups.filter(p => p.status === 'completed').length;
    const pending = total - completed;
    const overflow = pickups.filter(p => p.overflow && p.status !== 'completed').length;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-fade-in-up">
            <StatCard
                label="Shift Progress"
                value={`${progress}%`}
                icon={TrendingUp}
                color={{ bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500' }}
                progress={progress}
            />
            <StatCard
                label="Pending Tasks"
                value={pending}
                subtext={`of ${total} total`}
                icon={Clock}
                color={{ bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500' }}
            />
            <StatCard
                label="Completed"
                value={completed}
                icon={CheckCircle2}
                color={{ bg: 'bg-indigo-50', text: 'text-indigo-600', bar: 'bg-indigo-500' }}
            />
            <StatCard
                label="Urgent / Overflow"
                value={overflow}
                icon={AlertTriangle}
                color={{ bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' }}
                subtext={overflow > 0 ? 'Action Required' : 'All Clear'}
            />
        </div>
    );
};

export default CollectorStats;
