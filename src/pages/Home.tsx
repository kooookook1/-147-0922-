import { Mail, Send, Bell, Plus, Wallet, ChevronLeft, ArrowLeft, Sparkles, Youtube, Globe, MessageCircle, X, Activity, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerServiceIcon, DocumentIcon, VideoPlayIcon } from '../components/Icons';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ZeaLogo from '../components/ZeaLogo';
import LazyImage from '../components/LazyImage';
import { databaseService } from '../services/databaseService';

const platforms = [
  { name: 'YouTube', logo: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', color: '#FF0000' },
  { name: 'TikTok', logo: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', color: '#000000' },
  { name: 'Facebook', logo: 'https://cdn-icons-png.flaticon.com/512/124/124010.png', color: '#1877F2' },
  { name: 'Instagram', logo: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', color: '#E4405F' },
];

const avatars = [
  'https://i.ibb.co/h1JK3LGv/pic1.png',
  'https://i.ibb.co/HT6NpGgH/pic2.png',
  'https://i.ibb.co/gFwK6jXk/pic3.png'
];

export default function Home() {
  const [announcement, setAnnouncement] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [activeMembers, setActiveMembers] = useState(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      phone: `****${Math.floor(1000 + Math.random() * 9000)}`,
      amount: (Math.random() * 100 + 20).toFixed(2),
      time: 'الآن',
      avatar: avatars[i % 3]
    }))
  );

  useEffect(() => {
    const msg = databaseService.getMaintenanceMessage();
    if (msg) {
      setAnnouncement(msg);
      setShowAnnouncement(true);
    }

    const interval = setInterval(() => {
      setActiveMembers(prev => {
        const next = [...prev];
        const last = next.pop()!;
        return [{ 
          ...last, 
          amount: (Math.random() * 100 + 20).toFixed(2),
          avatar: avatars[Math.floor(Math.random() * 3)]
        }, ...next];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pb-28 bg-[#0a0e17] text-white min-h-screen font-sans overflow-x-hidden selection:bg-blue-500/30" dir="rtl">
      {/* Animated Trading Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0e17] to-[#0a0e17]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6bTAgMHY0MGgxVjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+Cjwvc3ZnPg==')] opacity-30 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"></div>
      </div>

      {/* System Announcement Pop-up */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#131b2c] p-10 rounded-[48px] shadow-[0_0_50px_rgba(59,130,246,0.15)] text-center border border-white/10 max-w-sm w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-12 -mt-12" />
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                <Bell size={40} />
              </div>
              
              <h3 className="text-[22px] font-black text-white mb-4 leading-tight tracking-tighter">إشعار النظام</h3>
              
              <div className="bg-[#0a0e17] p-6 rounded-3xl border border-white/5 mb-10 text-right">
                <p className="text-gray-300 font-bold text-sm leading-relaxed whitespace-pre-wrap">{announcement}</p>
              </div>

              <button 
                onClick={() => setShowAnnouncement(false)}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black text-sm shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:from-blue-500 hover:to-indigo-500 transition-colors"
              >
                حسناً، فهمت المنصة
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Hero Header */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#1e3a8a]/20 via-[#131b2c] to-[#0a0e17] pt-6 pb-[120px] rounded-b-[40px] border-b border-white/5 z-10">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"
        />

        <div className="relative z-10 px-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <TrendingUp size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-wider">ZEA</h1>
                <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Trading Platform</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <motion.button onClick={() => setShowAnnouncement(true)} whileTap={{ scale: 0.9 }} className="w-10 h-10 bg-[#131b2c] rounded-xl flex items-center justify-center border border-white/10 text-gray-300 hover:text-white shadow-lg hover:border-blue-500/50 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse blur-[1px]"></span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
              <Link to="/support">
                <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 bg-[#131b2c] rounded-xl flex items-center justify-center border border-white/10 text-gray-300 hover:text-white shadow-lg hover:border-emerald-500/50 transition-colors">
                  <MessageCircle size={18} />
                </motion.button>
              </Link>
            </div>
          </div>

          <div className="mt-2 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 text-[11px] font-bold tracking-widest mb-4"
            >
              <Activity size={12} className="text-blue-400" /> شبكة التداول العالمية #1
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-3xl font-black mb-3 tracking-tighter"
            >
              مرحباً بك في منصة <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">الاستثمار</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm font-medium leading-relaxed mb-8 max-w-xs mx-auto"
            >
              استثمر في مهام السوشيال ميديا وحقق أرباحاً يومية تصل إلى 16$ عند الاشتراك وكسر السعر.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Transcending Wallet Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 -mt-[40px] relative z-20"
      >
        <div className="bg-[#131b2c] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 border border-white/5 flex gap-2">
          <Link to="/deposit" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-colors"
            >
              <Plus size={20} /> إيداع / شحن
            </motion.button>
          </Link>
          <Link to="/withdraw" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#0a0e17] hover:bg-[#1a2333] border border-white/5 text-gray-200 h-16 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Wallet size={20} /> سحب الأرباح
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Modern Quick Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-6 mt-6 relative z-20"
      >
        <div className="bg-[#131b2c] rounded-[24px] shadow-lg p-5 border border-white/5 flex justify-between items-center gap-2">
          {[
            { icon: VideoPlayIcon, label: 'الفيديو', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', link: '/tasks' },
            { icon: DocumentIcon, label: 'الدليل', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', link: '/tasks' },
            { icon: CustomerServiceIcon, label: 'الدعم', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', link: '/support' },
          ].map((action, i) => (
            <Link key={i} to={action.link} className="flex-1">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center w-full group"
              >
                <div className={`w-14 h-14 ${action.bg} ${action.text} rounded-2xl flex items-center justify-center mb-2 border ${action.border} group-hover:bg-opacity-20 transition-all`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-200 transition-colors">{action.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Professional Advertising Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-6 mt-8"
      >
        <div className="relative overflow-hidden rounded-[32px] min-h-[220px] group cursor-pointer border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          {/* Main Background Image */}
          <div className="absolute inset-0">
             <LazyImage 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000" 
              alt="Banner Background" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e17] via-[#0a0e17]/80 to-transparent" />
          </div>
          
          <div className="relative z-10 w-full p-8 flex justify-between items-center text-white">
            <div className="max-w-[70%]">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-lg text-[9px] font-bold tracking-widest mb-3 border border-amber-500/20 text-amber-400"
              >
                <Sparkles size={10} /> عرض استثماري حصري
              </motion.div>
              <h3 className="text-2xl font-black mb-2 leading-tight tracking-tight">
                أرباح <span className="text-emerald-400">فورية</span> للتسجيل
              </h3>
              <p className="text-gray-400 text-[11px] font-bold mb-5 max-w-[200px] leading-relaxed">
                انتقل إلى VIP 1 اليوم وضاعف أرباحك وعوائد مهامك منذ اللحظة الأولى.
              </p>
              <Link to="/vip">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl border border-white/10 text-[12px] font-bold flex items-center gap-2 backdrop-blur-sm transition-all"
                >
                  اكتشف المزيد <ArrowLeft size={16} className="rotate-180" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Platform Grid */}
      <div className="mt-10 px-6">
        <div className="flex justify-between items-end mb-6">
          <div>
             <h2 className="text-lg font-black text-white mb-1 tracking-wide">المهام المتاحة</h2>
             <p className="text-[11px] text-gray-500 font-bold tracking-wide">اختر مزود الخدمة للبدء.</p>
          </div>
          <Link to="/tasks">
            <motion.button whileHover={{ x: -4 }} className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300">
              عرض المزيد <ChevronLeft size={14} />
            </motion.button>
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {platforms.map((platform, idx) => (
            <Link key={platform.name} to="/tasks">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div 
                  className="w-16 h-16 rounded-2xl bg-[#131b2c] flex items-center justify-center mb-2 p-3.5 border border-white/5 relative overflow-hidden transition-all group-hover:border-blue-500/30 group-hover:bg-[#1a2333]"
                >
                  <LazyImage src={platform.logo} alt={platform.name} className="w-full h-full object-contain relative z-10 opacity-70 group-hover:opacity-100 transition-all duration-300" />
                </div>
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors uppercase tracking-wider">{platform.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="mt-12 px-6 pb-12 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-black text-white mb-1 tracking-wide">سحوبات حية</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> مباشر الآن
            </div>
          </div>
        </div>

        <div className="bg-[#131b2c] rounded-[24px] border border-white/5 overflow-hidden h-[300px] relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <motion.div 
            className="flex flex-col p-3 gap-3"
            animate={{ y: [0, -200, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {activeMembers.map((member, idx) => (
              <motion.div 
                key={`${member.id}-${idx}`}
                className="flex items-center justify-between bg-[#0a0e17] p-3.5 rounded-[16px] border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a2333] to-[#131b2c] rounded-xl flex items-center justify-center p-0.5 border border-white/10 overflow-hidden">
                    <LazyImage src={member.avatar} alt="avatar" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-gray-300 font-mono tracking-widest">{member.phone}</span>
                    <span className="text-[10px] text-gray-500">تم الإيداع</span>
                  </div>
                </div>
                <div className="bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <span className="text-[13px] font-black text-emerald-400 font-mono">+${member.amount}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#131b2c] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#131b2c] to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}


