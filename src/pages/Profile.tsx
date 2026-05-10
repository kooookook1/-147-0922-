import { ChevronLeft, CreditCard, Wallet, Smile, Landmark, FileText, Store, Gift, User, Settings, ShieldCheck, LogOut, Layout, Star, Link as LinkIcon, QrCode, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { databaseService, User as DBUser } from '../services/databaseService';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DBUser | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    setUser(databaseService.getCurrentUser());
  }, []);

  const handleLogout = () => {
    databaseService.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-24 font-sans text-right overflow-x-hidden" dir="rtl">
      {/* Dynamic Glass Header */}
      <div className="relative bg-gradient-to-br from-[#1e40af] to-[#3b82f6] text-white pt-16 pb-28 px-8 overflow-hidden">
        {/* Decorative Background Effects */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-80 h-80 bg-blue-400 rounded-full blur-[90px] opacity-20"
        />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
             <motion.div 
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-20 h-20 rounded-[28px] overflow-hidden border-4 border-white/20 p-1 bg-white/10 backdrop-blur-xl shadow-2xl"
             >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" className="w-full h-full object-contain rounded-[20px]" />
             </motion.div>
             <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight">{user.name}</span>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${user.vipLevel > 0 ? 'bg-amber-400 text-amber-950 border-transparent shadow-lg shadow-amber-400/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {user.vipLevel > 0 ? `VIP Level ${user.vipLevel}` : 'حساب عادي'}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500 text-white px-2.5 py-1 rounded-full shadow-lg shadow-blue-500/20">نقاط الشرف: {user.honorPoints}</span>
                  <span className="text-[9px] font-bold text-blue-100 opacity-70 uppercase">ID: {user.id}</span>
                </div>
             </div>
          </div>
          <motion.button 
             whileHover={{ rotate: 180 }}
             transition={{ type: "spring", stiffness: 200 }}
             className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[22px] flex items-center justify-center border border-white/20 shadow-lg"
          >
            <Settings size={26} />
          </motion.button>
        </div>
      </div>

      {/* Floating Modern Wallet Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 -mt-16 relative z-10 bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] p-8 border border-gray-50"
      >
        <div className="flex items-start justify-between mb-10">
          <div className="flex flex-col">
            <span className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-2">الرصيد القابل للسحب</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-gray-800 tracking-tighter">${user.balance.toFixed(2)}</span>
              <span className="text-blue-600 font-black text-sm">USDT</span>
            </div>
          </div>
          <Link to="/withdraw">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-blue-600 text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-600/30"
            >
              <Wallet size={24} />
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'أرباح اليوم', value: '$12.50', bg: 'bg-blue-50', color: 'text-blue-600' },
             { label: 'دخل الفريق', value: `$${(user.invitations * 0.5).toFixed(2)}`, bg: 'bg-emerald-50', color: 'text-emerald-600' },
             { label: 'إجمالي المهام', value: '450', bg: 'bg-purple-50', color: 'text-purple-600' },
             { label: 'أيام النشاط', value: '12 يوم', bg: 'bg-amber-50', color: 'text-amber-500' },
           ].map((stat, i) => (
             <div key={i} className={`${stat.bg} p-5 rounded-[24px] border border-white shadow-sm`}>
                <span className="text-[10px] font-black text-gray-400 block mb-1.5 uppercase">{stat.label}</span>
                <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
             </div>
           ))}
        </div>
      </motion.div>

      {/* Referral & Team System */}
      <div className="mt-10 px-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
           <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 block">رابط الدعوة الخاص بك</span>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between bg-white shadow-inner rounded-2xl p-4 border border-white/10">
                   <span className="text-xl font-mono font-black tracking-[0.2em] text-[#1a56db]">{user.invitationCode || user.id}</span>
                   <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user.invitationCode || user.id);
                      toast.success('تم نسخ الرمز بنجاح');
                    }}
                    className="bg-[#1a56db] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                   >
                     نسخ الرمز
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      const refLink = `${window.location.origin}/signup?ref=${user.invitationCode || user.id}`;
                      navigator.clipboard.writeText(refLink);
                      toast.success('تم نسخ رابط الدعوة بنجاح');
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-2xl text-[11px] font-black border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <LinkIcon size={14} /> نسخ الرابط
                  </button>
                  <button 
                    onClick={() => setShowQR(true)}
                    className="bg-blue-400 text-white py-3.5 rounded-2xl text-[11px] font-black shadow-lg shadow-blue-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <QrCode size={14} /> عرض الباركود
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">الفريق النشط (VIP)</span>
                    <span className="text-sm font-black text-emerald-400">{user.invitations} موظف</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">إجمالي الدعوات</span>
                    <span className="text-sm font-black text-gray-300">{user.totalInvited} شخص</span>
                 </div>
              </div>
              
              {/* Progress to next level */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-blue-400">التقدم للقائد مستوى 1</span>
                  <span className="text-[10px] font-black text-white">{user.invitations}/10</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(user.invitations / 10) * 100}%` }}
                    className="h-full bg-blue-500 rounded-full" 
                  />
                </div>
                <p className="text-[9px] text-gray-400 mt-2 font-bold italic">* ستحصل على مكافآت إضافية عند وصولك للمستوى الأول (10 أشخاص)</p>
              </div>
           </div>
        </div>
      </div>

      {/* Modern Settings List */}
      <div className="mt-10 px-6 space-y-4">
        <h3 className="text-lg font-black text-gray-800 mr-2 mb-4">إعدادات الحساب</h3>
        {[
          { icon: CreditCard, label: 'سجل شحن الرصيد', color: 'text-blue-600', bg: 'bg-blue-50', path: '/record?category=finance&tab=deposit' },
          { icon: FileText, label: 'سجل سحب الأرباح', color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/record?category=finance&tab=withdrawal' },
          { icon: Landmark, label: 'بيانات المحفظة', color: 'text-purple-600', bg: 'bg-purple-50', path: '#' },
          { icon: ShieldCheck, label: 'مركز الأمان', color: 'text-amber-600', bg: 'bg-amber-50', path: '#' },
          { icon: Gift, label: 'صندوق المكافآت', color: 'text-rose-600', bg: 'bg-rose-50', path: '#' },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ x: -10, backgroundColor: '#f8fafc' }}
            onClick={() => item.path !== '#' && navigate(item.path)}
            className="flex items-center justify-between p-5 bg-white rounded-[28px] shadow-sm border border-gray-100 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-[20px] flex items-center justify-center p-2.5`}>
                <item.icon size={22} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-black text-gray-700">{item.label}</span>
            </div>
            <ChevronLeft size={20} className="text-gray-300" />
          </motion.div>
        ))}
      </div>

      {/* Admin Link Section */}
      {user?.email === 'admin@zea.com' && (
      <div className="mt-12 px-8">
         <Link to="/owner-admin" className="group">
           <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className="flex flex-col items-center justify-center w-full py-8 border-4 border-dashed border-blue-50 rounded-[40px] bg-blue-50/30 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all"
           >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-xl shadow-blue-500/5 group-hover:scale-110 transition-transform">
                <Layout size={28} />
              </div>
              <span className="text-[14px] font-black text-blue-900 mb-1">لوحة تحكم الوكيل</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">Admin Dashboard Access</span>
           </motion.div>
         </Link>
      </div>
      )}

      {/* Auth Section */}
      <div className="mt-10 px-8 pb-12 space-y-4">
        <Link to="/login" className="w-full">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-600/10"
          >
            <User size={20} /> تسجيل الدخول / حساب جديد
          </motion.button>
        </Link>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full py-5 bg-rose-50 text-rose-600 rounded-[28px] font-black text-sm flex items-center justify-center gap-3 border border-rose-100"
        >
          <LogOut size={20} /> تسجيل الخروج
        </motion.button>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[40px] p-10 flex flex-col items-center shadow-2xl"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-6 left-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-black text-gray-800 mb-2">باركود الدعوة</h3>
              <p className="text-gray-400 text-xs font-bold mb-8 text-center px-4">امسح الباركود للانضمام إلى فريقي وبدء العمل</p>

              <div className="p-6 bg-white rounded-[32px] shadow-2xl border border-gray-50 mb-8 relative" id="qr-code-to-download">
                <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full" />
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/signup?ref=${user.invitationCode || user.id}`)}`} 
                  alt="QR Code" 
                  id="qr-image"
                  className="w-48 h-48 relative z-10"
                />
              </div>

              <div className="flex flex-col items-center gap-1 mb-6">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">REFFERAL CODE</span>
                <span className="text-2xl font-black text-gray-900 tracking-[0.2em]">{user.invitationCode || user.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${window.location.origin}/signup?ref=${user.invitationCode || user.id}`)}`;
                    const link = document.createElement('a');
                    link.href = qrUrl;
                    link.download = `invite-${user.invitationCode}.png`;
                    document.body.appendChild(link);
                    // link.click(); // Note: browser might block popup, but we can try
                    window.open(qrUrl, '_blank');
                    toast.success('جاري فتح صورة الباركود للحفظ');
                  }}
                  className="bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-black active:scale-95 transition-all text-[11px]"
                >
                  حفظ الباركود
                </button>
                <button 
                  onClick={() => {
                    const refLink = `${window.location.origin}/signup?ref=${user.invitationCode || user.id}`;
                    navigator.clipboard.writeText(refLink);
                    toast.success('تم نسخ الرابط');
                  }}
                  className="bg-[#1a56db] text-white py-3.5 rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-[11px]"
                >
                  نسخ الرابط
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

