import React from 'react';
import {
    Package,
    Search,
    Plus,
    Clock,
    User,
    ClipboardList,
    X,
    Loader2,
    Truck,
    ShieldCheck,
    Smartphone,
    CheckCircle,
    RefreshCw,
    Activity,
    LogOut,
    Boxes
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const ParcelManagement = () => {
    const [parcels, setParcels] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isDeliverModalOpen, setIsDeliverModalOpen] = React.useState(false);
    const [selectedParcel, setSelectedParcel] = React.useState<any>(null);
    const [otp, setOtp] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');

    const fetchParcels = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/parcels');
            setParcels(data);
        } catch (error) {
            toast.error('Logistics registry sync failed');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchParcels();
    }, []);

    const handleReceive = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const target = e.target as any;
            const payload = {
                studentId: target.studentId.value,
                courierName: target.courierName.value,
                trackingId: target.trackingId.value,
                notes: ''
            };
            await api.post('/parcels', payload);
            toast.success('Shipment logged. Recipient notified.');
            setIsAddModalOpen(false);
            fetchParcels();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Logging failed');
        }
    };

    const handleDeliver = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/parcels/${selectedParcel._id}/deliver`, { pickupCode: otp });
            toast.success('Release authorized.');
            setIsDeliverModalOpen(false);
            setOtp('');
            fetchParcels();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid authorization code');
        }
    };

    const filteredParcels = parcels.filter(p =>
        p.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.student?.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.courierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        inStorage: parcels.filter(p => p.status === 'Arrived').length,
        releasedToday: parcels.filter(p => p.status === 'Delivered' && p.deliveredAt && new Date(p.deliveredAt).toDateString() === new Date().toDateString()).length,
        total: parcels.length
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Logistics...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Enterprise Logistics Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 p-10 lg:p-12">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px]" />

                <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full backdrop-blur-md">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em]">Logistics Hub</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Registry Online</span>
                            </div>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-4">Parcel Logistics</h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Centralized oversight of inbound shipments, inventory lifecycle, and secure recipient handover protocols.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            onClick={() => fetchParcels()}
                            className="p-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700 shadow-xl group active:scale-95"
                        >
                            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Plus size={20} />
                            Log Inbound Entry
                        </button>
                    </div>
                </div>

                {/* High-Density Logistics HUD */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    <MetricTile label="Active In-Storage" value={stats.inStorage} icon={<Boxes size={20} />} color="amber" />
                    <MetricTile label="Released Cycle" value={stats.releasedToday} icon={<LogOut size={20} />} color="emerald" />
                    <MetricTile label="System Volume" value={stats.total} icon={<ClipboardList size={20} />} color="indigo" />
                    <MetricTile label="Fleet Efficiency" value="98.4%" icon={<Truck size={20} />} color="slate" />
                </div>
            </div>

            {/* Registry Control Deck */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                            <Activity size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Live Shipment Stream</p>
                            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">Active Inventory Log</p>
                        </div>
                    </div>

                    <div className="relative group min-w-[320px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by recipient, courier or tracking..."
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recipient Identity</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner & Reference</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Temporal Marker</th>
                                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Storage State</th>
                                <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Handover Portal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredParcels.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-4 border-dashed border-slate-100">
                                                <Package size={32} className="text-slate-200" />
                                            </div>
                                            <p className="text-[15px] font-black text-slate-300 uppercase tracking-widest">Registry Empty</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredParcels.map((parcel) => (
                                    <tr key={parcel._id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-10 py-5">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-[18px] shadow-lg group-hover:scale-105 transition-transform duration-500">
                                                    {parcel.student?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-black text-slate-900 leading-none mb-1.5">{parcel.student?.name}</p>
                                                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest leading-none">SID: {parcel.student?.profile?.studentId || '--'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-5">
                                            <p className="text-[14px] font-black text-slate-700 uppercase tracking-tight leading-none mb-1.5">{parcel.courierName}</p>
                                            <p className="text-[10px] text-slate-400 font-mono font-bold tracking-widest">#{parcel.trackingId || 'N/A'}</p>
                                        </td>
                                        <td className="px-10 py-5 text-center">
                                            <p className="text-[13px] font-black text-slate-700 leading-none mb-1.5">{new Date(parcel.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{new Date(parcel.arrivedAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-10 py-5 text-center">
                                            <div className="flex justify-center">
                                                {parcel.status === 'Arrived' ? (
                                                    <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-amber-50 text-amber-600 border border-amber-100/50 shadow-sm">
                                                        In-Stock
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-slate-100 text-slate-400 border border-slate-200/50 shadow-inner">
                                                        Released
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-5 text-right">
                                            {parcel.status === 'Arrived' ? (
                                                <button
                                                    onClick={() => { setSelectedParcel(parcel); setIsDeliverModalOpen(true); }}
                                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.05] active:scale-95"
                                                >
                                                    Authorize Release
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2 text-emerald-500 px-2">
                                                    <CheckCircle size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logged Release</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Entry Portal Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-[12px] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-100">
                                    <Package className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Shipment Inbound</h2>
                                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest leading-none mt-1">Registry Entry Protocol</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleReceive} className="p-12 space-y-8">
                            <div className="space-y-6">
                                <HighDensityInput name="studentId" label="Recipient System ID" placeholder="Search SID (e.g. 2024001)" icon={<User size={18} />} />
                                <HighDensityInput name="courierName" label="Logistics Carrier" placeholder="e.g. BlueDart, Amazon, DHL" icon={<Truck size={18} />} />
                                <HighDensityInput name="trackingId" label="Inbound Tracking Ref" placeholder="Scan or Type Tracking ID" icon={<Smartphone size={18} />} />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-5 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95"
                                >
                                    Commit to Registry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Handover Security Modal */}
            {isDeliverModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-[12px] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden text-center p-12 border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200 border-4 border-slate-100">
                            <ShieldCheck size={36} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Auth Verification</h3>
                        <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-10">Handover Protocol Required</p>

                        <form onSubmit={handleDeliver} className="space-y-8">
                            <div className="relative">
                                <input
                                    required
                                    autoFocus
                                    type="text"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="0 0 0 0"
                                    className="w-full text-center text-5xl font-black tracking-[1rem] py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:border-indigo-600 outline-none shadow-inner transition-all placeholder:text-slate-200 text-slate-900"
                                />
                                <p className="absolute -bottom-6 left-0 right-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient One-Time Access Key</p>
                            </div>

                            <div className="pt-8 space-y-4">
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.2em] hover:bg-indigo-500 shadow-2xl shadow-indigo-100 transition-all active:scale-95"
                                >
                                    Authorize Release
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDeliverModalOpen(false)}
                                    className="w-full py-4 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:text-rose-600 transition-colors"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricTile = ({ label, value, icon, color }: any) => {
    const colors: any = {
        amber: 'bg-amber-500 text-white shadow-amber-900/20',
        emerald: 'bg-emerald-500 text-white shadow-emerald-900/20',
        indigo: 'bg-indigo-600 text-white shadow-indigo-900/20',
        slate: 'bg-slate-500 text-white shadow-slate-900/20',
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] group transition-all hover:bg-white/20">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                    {icon}
                </div>
                <span className="text-3xl font-black text-white tracking-tighter leading-none">{value}</span>
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{label}</p>
        </div>
    );
};

const HighDensityInput = ({ name, label, placeholder, icon }: any) => (
    <div className="space-y-2.5 group">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors">
                {icon}
            </div>
            <input
                id={name}
                name={name}
                required
                type="text"
                placeholder={placeholder}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none shadow-inner transition-all placeholder:text-slate-300"
            />
        </div>
    </div>
);

export default ParcelManagement;
