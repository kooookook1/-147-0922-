import { Mail, Send, Bell, Plus, Wallet, ChevronLeft, ArrowLeft, Sparkles, Youtube, Globe, MessageCircle, X } from 'lucide-react';
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
    <div className="pb-28 bg-[#fdfdfd] min-h-screen font-sans overflow-x-hidden" dir="rtl">
      {/* System Announcement Pop-up */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[48px] shadow-2xl text-center border border-white max-w-sm w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-12 -mt-12" />
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="absolute top-8 left-8 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Bell size={40} />
              </div>
              
              <h3 className="text-[22px] font-black text-gray-800 mb-4 leading-tight tracking-tighter">تنبيه من إدارة ZEA</h3>
              
              <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-50 mb-10 text-right">
                <p className="text-gray-600 font-bold text-sm leading-relaxed whitespace-pre-wrap">{announcement}</p>
              </div>

              <button 
                onClick={() => setShowAnnouncement(false)}
                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-600/20"
              >
                حسناً، فهمت
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Hero Header */}
      <div className="relative w-full h-[380px] overflow-hidden bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#60a5fa]">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-10 -left-10 w-72 h-72 bg-white/20 rounded-full blur-[80px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-[100px]"
        />

        <div className="relative z-10 p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <ZeaLogo />
            
            <div className="flex gap-2">
              <motion.button onClick={() => setShowAnnouncement(true)} whileTap={{ scale: 0.9 }} className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 text-white shadow-lg">
                <Bell size={18} />
              </motion.button>
              <Link to="/support">
                <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 text-white shadow-lg">
                  <MessageCircle size={18} />
                </motion.button>
              </Link>
            </div>
          </div>

          <div className="mt-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-4"
            >
              <Sparkles size={12} className="text-amber-300" /> المنصة العالمية رقم #1
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-4xl font-black mb-2 tracking-tighter"
            >
              مرحباً بك في ZEA
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-blue-50 text-sm font-medium opacity-90 leading-relaxed mb-6"
            >
              استثمر في مهام السوشيال ميديا وحقق أرباحاً يومية تصل إلى 16$ عند الاشتراك وكسر السعر.
            </motion.p>

            {/* Functional Wallet Buttons */}
            <div className="flex gap-3">
              <Link to="/deposit" className="flex-1">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-blue-600 h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20"
                >
                  <Plus size={20} /> شحن المحفظة
                </motion.button>
              </Link>
              <Link to="/withdraw" className="flex-1">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-blue-700/50 backdrop-blur-md border border-white/20 text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl"
                >
                  <Wallet size={20} /> سحب الأرباح
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Quick Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-6 -mt-12 relative z-20"
      >
        <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(37,99,235,0.1)] p-6 border border-gray-50 flex justify-between items-center gap-2">
          {[
            { icon: VideoPlayIcon, label: 'فيديو تعليمي', bg: 'bg-blue-50', text: 'text-blue-600', link: '/tasks' },
            { icon: DocumentIcon, label: 'دليل المنصة', bg: 'bg-emerald-50', text: 'text-emerald-600', link: '/tasks' },
            { icon: CustomerServiceIcon, label: 'مركز الدعم', bg: 'bg-amber-50', text: 'text-amber-600', link: '/support' },
          ].map((action, i) => (
            <Link key={i} to={action.link} className="flex-1">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center w-full"
              >
                <div className={`w-14 h-14 ${action.bg} ${action.text} rounded-[22px] flex items-center justify-center mb-3 shadow-sm border border-white`}>
                  <action.icon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-black text-gray-600">{action.label}</span>
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
        className="mx-6 mt-10"
      >
        <div className="relative overflow-hidden rounded-[40px] shadow-2xl min-h-[200px] group cursor-pointer">
          {/* Main Background Image */}
          <div className="absolute inset-0">
             <LazyImage 
              src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000" 
              alt="Banner Background" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/40 to-transparent" />
          </div>
          
          <div className="relative z-10 w-full p-8 flex justify-between items-center text-white">
            <div className="max-w-[70%]">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border border-white/10"
              >
                <Sparkles size={10} className="text-amber-300" /> عرض محدود لفترة وجيزة
              </motion.div>
              <h3 className="text-2xl font-black mb-1 leading-tight tracking-tight">
                احصل على <span className="text-blue-400">بونص</span> التسجيل
              </h3>
              <p className="text-blue-100/70 text-[11px] font-bold mb-5 max-w-[200px]">
                انتقل إلى VIP 1 اليوم وضاعف أرباحك من اليوم الأول مع ZEA.
              </p>
              <Link to="/vip">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-900 px-8 py-3 rounded-2xl text-[12px] font-black shadow-xl flex items-center gap-2"
                >
                  اكتشف المزيد <ArrowLeft size={16} className="rotate-180" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Platform Grid with Hover Effects */}
      <div className="mt-10 px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
             <h2 className="text-2xl font-black text-gray-800 mb-1">اختر المنصة</h2>
             <p className="text-xs text-gray-400 font-bold">ابدأ بتنفيذ المهام من التطبيق المفضل لديك.</p>
          </div>
          <Link to="/tasks">
            <motion.button whileHover={{ x: -4 }} className="text-blue-600 text-xs font-black flex items-center gap-1">
              مشاهدة الكل <ChevronLeft size={16} />
            </motion.button>
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-5">
          {platforms.map((platform, idx) => (
            <Link key={platform.name} to="/tasks">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div 
                  className="w-16 h-16 rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-3 p-4 border border-gray-100 relative overflow-hidden transition-all group-hover:shadow-blue-500/10 group-hover:border-blue-100"
                >
                  <LazyImage src={platform.logo} alt={platform.name} className="w-full h-full object-contain relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-500 bg-transparent" />
                  <div 
                    className="absolute inset-x-0 bottom-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                    style={{ backgroundColor: platform.color }}
                  />
                </div>
                <span className="text-[11px] font-black text-gray-500 group-hover:text-gray-800">{platform.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Upgrade Banner */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="mx-6 mt-12 rounded-[40px] overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#3b82f6] p-8 text-white relative shadow-[0_20px_50px_rgba(30,58,138,0.3)]"
      >
        {/* Golden glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-[60px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm">
              عرض VIP حصري
            </span>
          </div>
          <h3 className="text-[32px] font-black mb-3 leading-[1.1] tracking-tight text-white drop-shadow-sm">
            ارتقِ بعضويتك<br />وضاعف أرباحك
          </h3>
          <p className="text-blue-100/90 text-[13px] font-bold mb-8 max-w-[210px] leading-relaxed">
            اشترك الآن في عضوية <span className="text-amber-300 font-black">VIP</span> واحصل على مهام عالية القيمة ودخل يومي مضاعف.
          </p>
          <Link to="/vip">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#0f172a] px-8 py-3.5 rounded-[20px] text-[13px] font-black shadow-2xl flex items-center gap-3 transition-colors"
            >
              تفعيل العضوية الآن
              <ChevronLeft size={18} className="text-amber-500" />
            </motion.button>
          </Link>
        </div>
        
        {/* 3D Illustration / Decorative Graphic */}
        <div className="absolute -bottom-4 -left-6 w-64 h-64 opacity-90 pointer-events-none transform rotate-12">
           <motion.div
             animate={{ 
               y: [0, -12, 0],
               scale: [1, 1.03, 1],
               rotate: [12, 8, 12]
             }}
             transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
           >
             <LazyImage 
              src="https://cdn-icons-png.flaticon.com/512/5110/5110754.png" 
              alt="VIP Premium" 
              className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" 
             />
           </motion.div>
        </div>
      </motion.div>

      {/* Live Activity with 3D Avatars */}
      <div className="mt-14 px-6 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">نشاط الأرباح</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> مباشر الآن
            </div>
          </div>
        </div>

        <div className="bg-[#f8fafc] rounded-[40px] border border-gray-100 shadow-inner overflow-hidden h-[340px] relative">
          <motion.div 
            className="flex flex-col p-4 gap-4"
            animate={{ y: [0, -200, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {activeMembers.map((member, idx) => (
              <motion.div 
                key={`${member.id}-${idx}`}
                className="flex items-center justify-between bg-white p-4 rounded-[28px] border border-gray-50 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-[20px] shadow-sm flex items-center justify-center p-0.5 border-2 border-white overflow-hidden">
                    <LazyImage src={member.avatar} alt="avatar" className="w-full h-full object-contain bg-blue-50" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-gray-800">{member.phone}</span>
                    <span className="text-[10px] text-gray-400 font-bold">سحب ناجح</span>
                  </div>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                  <span className="text-[15px] font-black text-emerald-600">${member.amount}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#f8fafc] to-transparent z-10" />
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#f8fafc] to-transparent z-10" />
        </div>
      </div>
    </div>
  );
}

