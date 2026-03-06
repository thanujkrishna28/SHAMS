import React from 'react';
import {
    Clock,
    Zap,
    Calendar,
    CheckCircle2,
    Play,
    History,
    RefreshCw,
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const LaundryManagement = () => {
    const [machines, setMachines] = React.useState<any[]>([]);
    const [myBookings, setMyBookings] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isBooking, setIsBooking] = React.useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [machData, bookData] = await Promise.all([
                api.get('/laundry/machines'),
                api.get('/laundry/my-bookings')
            ]);
            setMachines(machData.data);
            setMyBookings(bookData.data);
        } catch (error) {
            toast.error('Failed to load laundry data');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleBook = async (machineId: string) => {
        try {
            setIsBooking(true);
            await api.post('/laundry/book', { machineId, duration: 45 }); // Default 45 mins
            toast.success('Machine booked! You have 45 minutes.');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 text-center md:text-left">Smart Laundry</h1>
                <p className="text-slate-500 font-medium text-center md:text-left">Real-time machine availability and booking</p>
            </div>

            {/* machines grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.length === 0 && !isLoading ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium italic">No machines registered in the system yet.</p>
                    </div>
                ) : machines.map((machine) => (
                    <motion.div
                        key={machine._id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center text-center relative overflow-hidden group"
                    >
                        {/* Status Badge */}
                        <div className={`
                            absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${machine.status === 'Available' ? 'bg-emerald-100 text-emerald-600' :
                                machine.status === 'Running' ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}
                        `}>
                            {machine.status}
                        </div>

                        <div className={`
                            w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500
                            ${machine.status === 'Available' ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' :
                                machine.status === 'Running' ? 'bg-indigo-50 text-indigo-500 group-hover:scale-110 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-300'}
                        `}>
                            {machine.status === 'Running' ? <RefreshCw size={40} className="animate-spin-slow" /> : <Zap size={40} />}
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-1">{machine.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{machine.type} • {machine.location}</p>

                        <button
                            disabled={machine.status !== 'Available' || isBooking}
                            onClick={() => handleBook(machine._id)}
                            className={`
                                w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95
                                ${machine.status === 'Available'
                                    ? 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            {machine.status === 'Available' ? 'Book Machine' :
                                machine.status === 'Running' ? 'In Use' : 'Under Maintenance'}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* My History */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <History className="text-indigo-500" />
                        My Booking History
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Machine</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {myBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">You haven't booked any machines yet</td>
                                </tr>
                            ) : myBookings.map((book) => (
                                <tr key={book._id}>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-900">{book.machine?.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{book.machine?.type}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-600">{new Date(book.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-indigo-500 px-3 py-1 bg-indigo-50 rounded-lg">{book.duration} Mins</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`
                                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${book.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}
                                        `}>
                                            {book.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LaundryManagement;
