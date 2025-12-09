import React from 'react';
import { useUsageStats } from '../hooks/useUsageStats';
import { BarChart3, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const { stats } = useUsageStats();

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Enterprise Compliance Dashboard</h1>
                    <p className="text-slate-500">Overview of screening activities and risk alerts.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Total License Checks"
                        value={stats.licenseChecks}
                        icon={Activity}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        label="Entity Screenings"
                        value={stats.entityScreening}
                        icon={ShieldCheck}
                        color="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        label="Forced Labor Checks"
                        value={stats.forcedLabor}
                        icon={AlertTriangle}
                        color="bg-amber-50 text-amber-600"
                    />
                    <StatCard
                        label="High Risk Alerts"
                        value="3"
                        icon={AlertTriangle}
                        color="bg-red-50 text-red-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-slate-400" />
                            Activity Volume
                        </h3>
                        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400">
                            Chart Placeholder (Recharts / Visx)
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Recent Alerts</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                                    <div>
                                        <p className="font-bold text-red-800 text-sm">Entity Match: Huawei Technologies</p>
                                        <p className="text-xs text-red-600">Denied Party List - Strict Embargo</p>
                                    </div>
                                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-red-200">Today</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
