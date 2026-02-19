import { motion } from 'framer-motion';
import {
    Users,
    Shield,
    Zap,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    Utensils,
    Wifi,
    Activity,
    HeartPulse,
    School,
    Wind,
    Droplets,
    Dumbbell
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AboutUs = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggering = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            className="max-w-7xl mx-auto space-y-24 py-16 px-6 lg:px-8"
        >
            {/* Hero Section */}
            <motion.div variants={fadeIn} className="text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                    className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-3xl mb-6 shadow-sm border border-indigo-100"
                >
                    <School size={38} />
                </motion.div>
                <h1 className="text-4xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight">
                    Vignan <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Smart Hostel</span>
                </h1>
                <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                    At Vignan University, we define campus living as more than just a stay. It's an ecosystem of
                    <span className="text-indigo-600"> safety</span>, <span className="text-violet-600">comfort</span>, and <span className="text-blue-600">innovation</span>.
                </p>
            </motion.div>

            {/* Main Stats / Facility Grid */}
            <motion.div variants={staggering} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Student Capacity" value="2500+" sub="Boys & Girls Hostels" color="indigo" />
                <StatCard icon={Wind} label="Living Options" value="AC / Non-AC" sub="Fully Furnished Rooms" color="blue" />
                <StatCard icon={Wifi} label="Connectivity" value="24/7" sub="High Speed Fiber Net" color="sky" />
                <StatCard icon={Shield} label="Security" value="Round-Clock" sub="CCTV & Guarded" color="emerald" />
            </motion.div>

            {/* Infrastructure Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div variants={fadeIn} className="space-y-8">
                    <div className="inline-flex px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full tracking-widest uppercase">
                        Our Infrastructure
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900">World-Class Facilities for Your Best Performance</h2>
                    <p className="text-lg text-gray-600 leading-relaxed italic border-l-4 border-indigo-600 pl-6">
                        "Designed with the Priyadarshini philosophy, our girls' hostel and boys' dormitories provide
                        a home-away-from-home experience with every student given a mattress, table, chair, and dedicated cupboard."
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><HeartPulse size={20} /></div>
                            <div>
                                <h4 className="font-bold text-sm">Medical Hub</h4>
                                <p className="text-xs text-gray-500">24/7 Ambulance & Doctor</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Dumbbell size={20} /></div>
                            <div>
                                <h4 className="font-bold text-sm">Fitness Center</h4>
                                <p className="text-xs text-gray-500">Indoor & Outdoor Gyms</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={20} /></div>
                            <div>
                                <h4 className="font-bold text-sm">Recreation</h4>
                                <p className="text-xs text-gray-500">Badminton & Table Tennis</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Droplets size={20} /></div>
                            <div>
                                <h4 className="font-bold text-sm">R.O Center</h4>
                                <p className="text-xs text-gray-500">Pure Drinking Water</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    variants={fadeIn}
                    className="relative rounded-[3rem] overflow-hidden shadow-2xl group"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=2069"
                        alt="Hostel Infrastructure"
                        className="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-8 left-8 right-8 z-20">
                        <div className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl border border-white/30 text-white">
                            <h4 className="font-bold text-lg">Priyadarshini & Guntur Residences</h4>
                            <p className="text-sm text-white/80">Hosting 2500+ future leaders across premium blocks.</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Specialized Section: Mess & Dining */}
            <motion.div
                variants={fadeIn}
                className="bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 rounded-[3.5rem] p-10 md:p-16 text-white overflow-hidden relative shadow-2xl"
            >
                <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 tracking-[0.2em] uppercase">
                            Health & Quality
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">Gourmet Campus <br />Dining Experience</h2>
                        <p className="text-gray-400 text-lg leading-relaxed font-light">
                            Managed by a student-led committee, Vignan's mess provides both <span className="text-green-400 font-medium">Vegetarian</span> and <span className="text-rose-400 font-medium">Non-Vegetarian</span> options.
                            Our meals are served in massive, hygienic dining halls with high-speed service.
                        </p>

                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl"><Zap size={20} /></div>
                                <h4 className="font-bold">Biogas Project</h4>
                            </div>
                            <p className="text-sm text-gray-500">
                                Sustainability at core: All food waste is processed in our on-campus
                                Biogas Plant, generating cooking gas for the mess kitchens.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <NavLink
                                to="/student/mess"
                                className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 text-base shadow-xl shadow-indigo-500/30"
                            >
                                <Utensils size={20} />
                                Live Mess Portal
                            </NavLink>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <MetricBox label="Seating Capacity" value="2000+" sub="Large Dining Halls" />
                        <MetricBox label="Hygiene Level" value="A+" sub="FSSAI Standard" />
                        <MetricBox label="Daily Menu" value="Balanced" sub="Veg & Non-Veg" />
                        <MetricBox label="Feedback Rate" value="95%" sub="Student Satisfaction" />
                    </div>
                </div>
            </motion.div>

            {/* Support / Help Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12">
                <motion.div variants={fadeIn} className="space-y-8">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Need Assistance?</h2>
                        <p className="text-gray-500 text-lg max-w-md">Our dedicated wardens and tech support are available around the clock to assist you.</p>
                    </div>
                    <div className="space-y-6">
                        <ContactRow icon={Mail} label="Academic Support" value="hostel.support@vignan.ac.in" />
                        <ContactRow icon={Phone} label="Emergency Line (24/7)" value="+91 86323 44700" />
                        <ContactRow icon={MapPin} label="Hostel Office" value="Priyadarshini Block, Vignan University" />
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeIn}
                    className="bg-indigo-600 rounded-[3rem] p-12 text-white flex flex-col items-center justify-center text-center space-y-8 shadow-2xl shadow-indigo-200 relative overflow-hidden"
                >
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-xl flex items-center justify-center">
                        <School size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold">Vignan University</h3>
                        <p className="text-white/80 font-medium">Standard of Excellence</p>
                    </div>
                    <p className="text-white/70 max-w-sm text-sm">
                        Committed to providing a safe, green, and vibrant hostel life for students from across the globe.
                    </p>
                    <button className="px-8 py-3 bg-white text-indigo-600 font-black rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 text-sm">
                        Hostel Prospectus <ExternalLink size={16} />
                    </button>
                </motion.div>
            </div>

            <footer className="pt-24 pb-12 text-center border-t border-gray-100">
                <p className="text-gray-400 text-sm font-medium">© 2026 Vignan Foundation for Science, Technology & Research. All rights reserved.</p>
            </footer>
        </motion.div>
    );
};

const StatCard = ({ icon: Icon, label, value, sub, color }: any) => {
    const theme: any = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        sky: 'bg-sky-50 text-sky-600 border-sky-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };
    return (
        <motion.div
            variants={{
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 }
            }}
            whileHover={{ y: -5 }}
            className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-soft text-center group transition-all"
        >
            <div className={`w-14 h-14 mx-auto mb-6 rounded-2xl ${theme[color]} flex items-center justify-center border group-hover:rotate-6 transition-all`}>
                <Icon size={28} />
            </div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</h4>
            <div className="text-2xl font-black text-gray-900 mb-1">{value}</div>
            <p className="text-[10px] text-gray-500 font-bold">{sub}</p>
        </motion.div>
    );
};

const MetricBox = ({ label, value, sub }: any) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-lg hover:border-indigo-500/50 transition-all group">
        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">{label}</div>
        <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 origin-left transition-transform">{value}</div>
        <div className="text-xs text-gray-400">{sub}</div>
    </div>
);

const ContactRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex gap-6 items-center group">
        <div className="w-14 h-14 bg-gray-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
            <Icon size={24} />
        </div>
        <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</div>
            <div className="text-gray-900 font-bold text-lg">{value}</div>
        </div>
    </div>
);

export default AboutUs;

