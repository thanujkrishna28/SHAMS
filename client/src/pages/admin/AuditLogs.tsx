import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAdmin';
import {
    History, Search, Calendar,
    ChevronLeft, ChevronRight, Loader2,
    Database, Download, RefreshCw
} from 'lucide-react';

const AuditLogs = () => {
    const [page, setPage] = useState(1);
    const { data: logsData, isLoading, refetch } = useAuditLogs(page);
    const [search, setSearch] = useState('');
    const [filterModel, setFilterModel] = useState('all');

    const filteredLogs = logsData?.data?.filter((log: any) => {
        const matchesSearch =
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.admin?.name?.toLowerCase().includes(search.toLowerCase()) ||
            log.details?.toLowerCase().includes(search.toLowerCase());
        const matchesModel = filterModel === 'all' || log.targetModel === filterModel;
        return matchesSearch && matchesModel;
    });

    const getModelColor = (model: string) => {
        switch (model) {
            case 'User': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'Complaint': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Allocation': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Leave': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Fee': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">System Audit Registry</h1>
                    <p className="text-[13px] text-slate-500 font-medium">Trace administrative actions and cryptographic system modifications</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={() => window.open(`${import.meta.env.VITE_API_URL}/reports/audit`, '_blank')}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-[11px] flex items-center gap-2 shadow-lg shadow-slate-200 uppercase tracking-widest active:scale-95 transition-all"
                    >
                        <Download size={16} />
                        Export Ledger
                    </button>
                </div>
            </div>

            {/* Registry Registry */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Database size={14} className="text-slate-400" />
                            <select
                                value={filterModel}
                                onChange={(e) => setFilterModel(e.target.value)}
                                className="bg-transparent text-[11px] font-bold text-slate-900 focus:outline-none cursor-pointer uppercase tracking-widest"
                            >
                                <option value="all">All Modules</option>
                                <option value="User">Resident Accounts</option>
                                <option value="Complaint">Support Tickets</option>
                                <option value="Allocation">Resource Mapping</option>
                                <option value="Leave">Exit Protocols</option>
                                <option value="Fee">Financial Transactions</option>
                            </select>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Filter actions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-1.5 w-64 bg-white border border-slate-200 rounded-lg text-[12px] font-bold outline-none focus:ring-2 focus:ring-slate-900/5 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Operator</th>
                                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Event</th>
                                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Context</th>
                                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">System Notes</th>
                                <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest">Network Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">Zero activity records matched</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs?.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-[12px] font-bold text-slate-900 leading-none mb-0.5">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                                                    {log.admin?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-bold text-slate-900 leading-tight">{log.admin?.name || 'System'}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{log.admin?.role || 'PROC'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[9px] font-bold uppercase tracking-widest shadow-sm">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border shadow-sm ${getModelColor(log.targetModel)}`}>
                                                {log.targetModel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[12px] text-slate-600 line-clamp-1 max-w-xs font-medium" title={log.details}>
                                                {log.details || 'Baseline modification recorded'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shadow-inner">
                                                {log.ipAddress || '127.0.0.1'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Found {filteredLogs?.length || 0} event sequences
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Page</span>
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg text-[12px] font-bold shadow-md shadow-slate-200">
                                {page}
                            </span>
                        </div>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
