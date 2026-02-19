import { motion } from 'framer-motion';
import { HardHat, Timer, Settings } from 'lucide-react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg w-full bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 p-12 text-center relative z-10 border border-gray-100"
            >
                <div className="relative inline-block mb-10">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="p-6 bg-indigo-600 rounded-full text-white shadow-xl shadow-indigo-200"
                    >
                        <Settings size={48} />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2 p-2 bg-amber-400 rounded-lg text-white font-bold text-xs"
                    >
                        <HardHat size={16} />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Portal Maintenance</h1>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                    We're currently performing some scheduled maintenance to improve your experience. The student portal will be back online shortly.
                </p>

                <div className="bg-gray-50 rounded-2xl p-6 flex items-center gap-4 text-left mb-8 border border-gray-100">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                        <Timer size={24} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Estimated Wait</div>
                        <div className="text-sm font-bold text-gray-700">~15-30 minutes</div>
                    </div>
                </div>

                <div className="text-xs text-gray-400 font-medium">
                    Thank you for your patience. Updates will be posted here.
                </div>
            </motion.div>
        </div>
    );
};

export default MaintenancePage;
