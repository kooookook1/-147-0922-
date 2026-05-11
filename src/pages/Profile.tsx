import { ChevronLeft, CreditCard, Wallet, Smile, Landmark, FileText, Store, Gift, User, Settings, ShieldCheck, LogOut, Layout, Star, Link as LinkIcon, QrCode, X, UploadCloud, DownloadCloud, Users, ArrowDown, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { databaseService, User as DBUser } from '../services/databaseService';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DBUser | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [walletModal, setWalletModal] = useState({ isOpen: false, address: '', network: 'TRC20-USDT' });
  const [securityModal, setSecurityModal] = useState({ isOpen: false, oldPass: '', newPass: '' });
  const [rewardModal, setRewardModal] = useState({ isOpen: false, code: '' });

  useEffect(() => {
    const fetchUser = () => {
      const u = databaseService.getCurrentUser();
      setUser(u);
      if (u) {
        setWalletModal(prev => ({ ...prev, address: u.walletAddress || '', network: u.walletNetwork || 'TRC20-USDT' }));
      }
    };
    fetchUser();
    // listening for storage events could be done too, but for mock setting it once is enough
  }, []);

  const handleWalletSave = () => {
    if (!walletModal.address) {
      toast.error('الرجاء إدخال عنوان المحفظة');
      return;
    }
    const updatedUser = { ...user!, walletAddress: walletModal.address, walletNetwork: walletModal.network };
    databaseService.updateUser(updatedUser);
    setUser(updatedUser);
    toast.success('تم الحفظ بنجاح');
    setWalletModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSecuritySave = () => {
    if (!securityModal.oldPass || !securityModal.newPass) {
      toast.error('الرجاء تعبئة جميع الحقول');
      return;
    }
    // Mock save
    toast.success('تم تغيير كلمة المرور بنجاح');
    setSecurityModal({ isOpen: false, oldPass: '', newPass: '' });
  };

  const handleRewardSubmit = () => {
    if (!rewardModal.code) return;
    try {
      const reward = databaseService.useDailyCode(user!.id, rewardModal.code);
      toast.success(`تم استخدام الكود بنجاح! حصلت على ${reward.reward} نقطة شرف و $${reward.balanceReward} رصيد`);
      setUser(databaseService.getCurrentUser()); // refresh user
      setRewardModal({ isOpen: false, code: '' });
    } catch (e: any) {
      toast.error(e.message || 'خطأ في استخدام كود المكافأة');
    }
  };

  const handleLogout = () => {
    databaseService.logout();
    navigate('/login');
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return '****';
    if (phone.length <= 4) return phone;
    return `${phone.slice(0, 5)}****`;
  };

  const calculateActiveDays = (joinedAtStr?: string) => {
    if (!joinedAtStr) return 1;
    const joinedAt = new Date(joinedAtStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  const calculateTotalRevenues = () => {
     if (!user) return '0.00';
     const rev = user.balance + user.honorPoints + (user.invitations * 10);
     return rev.toFixed(2).replace(/\.00$/, '');
  };

  const getTodayTaskIncome = () => {
    if (!user) return '0';
    const today = new Date().toISOString().split('T')[0];
    const records = databaseService.getTaskRecords(user.id);
    const sum = records
      .filter(r => r.createdAt.startsWith(today) && r.status === 'approved')
      .reduce((acc, curr) => acc + curr.reward, 0);
    return formatBalance(sum);
  };

  const getTotalTaskIncome = () => {
    if (!user) return '0';
    const records = databaseService.getTaskRecords(user.id);
    const sum = records
      .filter(r => r.status === 'approved')
      .reduce((acc, curr) => acc + curr.reward, 0);
    return formatBalance(sum + (user.honorPoints || 0));
  };

  const formatBalance = (val: number) => {
    if (val === 0) return '0';
    return val.toFixed(2).replace(/\.00$/, '');
  };

  const getRankLetter = (vipLevel: number) => {
    if (vipLevel <= 0) return 'F1';
    if (vipLevel === 1) return 'C1';
    if (vipLevel === 2) return 'C2';
    if (vipLevel >= 3) return 'B1';
    return 'F1';
  };

  if (!user) return null;

  return (
    <div className="bg-[#0a0e17] text-white min-h-screen pb-24 font-sans text-right overflow-x-hidden relative" dir="rtl">
      
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0e17] to-transparent"></div>
      </div>

      {/* Header and User Info Top */}
      <div className="bg-[#131b2c] pt-12 pb-20 px-6 relative z-10 border-b border-white/5 shadow-inner" dir="ltr">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
        <div className="flex items-center justify-center gap-4 relative z-10">
           <div className="w-[48px] h-[48px] bg-[#0a0e17] rounded-full flex items-center justify-center shadow-inner border border-white/10 p-1 hover:border-blue-500/50 transition-colors">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" className="w-full h-full object-contain rounded-full bg-[#1a2333] mix-blend-lighten opacity-80" />
           </div>
           <span className="text-[18px] font-mono tracking-widest text-gray-200">{maskPhone(user.phoneNumber || user.id)}</span>
           <span className="text-[14px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">{getRankLetter(user.vipLevel)}</span>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="relative bg-[#1a2333] pt-5 pb-6 px-5 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] mx-4 -mt-10 mb-6 border border-white/10 z-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px]" />
        
        <div className="flex justify-between items-end mb-2 relative z-10">
          <span className="text-blue-400 font-bold text-[12px] tracking-wide">الارباح (USDT)</span>
          <span className="text-gray-500 font-mono text-[11px]">100 USDT</span>
        </div>
        
        <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
          {/* Progress bar */}
          <div className="flex-1 h-1.5 bg-[#0a0e17] rounded-full overflow-hidden flex relative shadow-inner" dir="ltr">
            <div className="w-[85%] h-full bg-gradient-to-r from-blue-500 to-blue-400 relative shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          </div>
          <span className="text-3xl font-black text-white tracking-widest font-mono min-w-max textShadow-sm" dir="ltr">${formatBalance(user.balance)}</span>
        </div>

        <div className="grid grid-cols-3 gap-y-4 text-center mt-4 relative z-10">
           <div className="flex flex-col border-l border-white/5 px-1 hover:bg-white/5 rounded-xl transition-colors py-2">
              <span className="text-[10px] font-bold text-gray-400 mb-1.5">مكافأة الإحالة</span>
              <span className="text-sm font-black font-mono text-emerald-400" dir="ltr">${formatBalance(user.invitations * 10)}</span>
           </div>
           <div className="flex flex-col border-l border-white/5 px-1 hover:bg-white/5 rounded-xl transition-colors py-2">
              <span className="text-[10px] font-bold text-gray-400 mb-1.5">إجمالي الدخل</span>
              <span className="text-sm font-black font-mono text-blue-400" dir="ltr">${getTotalTaskIncome()}</span>
           </div>
           <div className="flex flex-col px-1 hover:bg-white/5 rounded-xl transition-colors py-2">
              <span className="text-[10px] font-bold text-gray-400 mb-1.5">دخل اليوم</span>
              <span className="text-sm font-black font-mono text-white" dir="ltr">${getTodayTaskIncome()}</span>
           </div>
        </div>

        <div className="grid grid-cols-2 text-center mt-3 pt-4 border-t border-white/10 relative z-10">
           <div className="flex flex-col border-l border-white/5 px-1 hover:bg-white/5 rounded-xl transition-colors py-2">
              <span className="text-[10px] font-bold text-gray-400 mb-1.5">أيام العمل الفعالة</span>
              <span className="text-sm font-black text-white font-mono" dir="ltr">{calculateActiveDays(user.joinedAt)}</span>
           </div>
           <div className="flex flex-col px-1 hover:bg-white/5 rounded-xl transition-colors py-2">
              <span className="text-[10px] font-bold text-gray-400 mb-1.5">إجمالي الإيرادات</span>
              <span className="text-sm font-black font-mono text-white" dir="ltr">${calculateTotalRevenues()}</span>
           </div>
        </div>
      </div>
      
      {/* Modern Settings List */}
      <div className="px-4 space-y-4 relative z-10">
        {/* Main List */}
        <div className="bg-[#131b2c] rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/5 overflow-hidden">
          {[
            { icon: UploadCloud, label: 'إيداع رصيد', iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', path: '/deposit', action: null },
            { icon: DownloadCloud, label: 'سحب الأموال', iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', path: '/withdraw', action: null },
            { icon: Users, label: 'رابط الدعوة', iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', path: '#', action: () => setShowQR(true) },
            { icon: Landmark, label: 'عنوان المحفظة', iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', path: '#', action: () => setWalletModal(prev => ({ ...prev, isOpen: true })) },
            { icon: ArrowDown, label: 'سجل الايداع', iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', path: '/record?category=finance&tab=deposit', action: null },
            { icon: ArrowUp, label: 'سجل السحب', iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', path: '/record?category=finance&tab=withdrawal', action: null },
          ].map((item, idx, arr) => (
            <motion.div 
              key={idx}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              onClick={() => {
                 if (item.action) item.action();
                 else if (item.path !== '#') navigate(item.path);
              }}
              className={`flex items-center justify-between p-4.5 cursor-pointer transition-colors ${idx !== arr.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shadow-inner ${item.iconBg}`}>
                  <item.icon size={18} strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-bold text-gray-300">{item.label}</span>
              </div>
              <ChevronLeft size={18} className="text-gray-600" />
            </motion.div>
          ))}
        </div>

        {/* Secondary List */}
        <div className="bg-[#131b2c] rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/5 overflow-hidden">
          {[
            ...(user?.email === 'admin@zea.com' || user?.phoneNumber?.includes('07751889723') ? [{ icon: Layout, label: 'لوحة الإدارة', iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', path: '/owner-admin', action: null }] : []),
            { icon: ShieldCheck, label: 'تغيير كلمة المرور', iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', path: '#', action: () => setSecurityModal(prev => ({ ...prev, isOpen: true })) },
            { icon: Gift, label: 'صندوق المكافآت', iconBg: 'bg-pink-500/10 text-pink-400 border border-pink-500/20', path: '#', action: () => setRewardModal(prev => ({ ...prev, isOpen: true })) },
            { icon: LogOut, label: 'تسجيل الخروج', iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', path: '#', action: handleLogout },
          ].map((item, idx, arr) => (
            <motion.div 
              key={idx}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              onClick={() => {
                 if (item.action) item.action();
                 else if (item.path !== '#') navigate(item.path);
              }}
              className={`flex items-center justify-between p-4.5 cursor-pointer transition-colors ${idx !== arr.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shadow-inner ${item.iconBg}`}>
                  <item.icon size={18} strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-bold text-gray-300">{item.label}</span>
              </div>
              <ChevronLeft size={18} className="text-gray-600" />
            </motion.div>
          ))}
        </div>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#131b2c] rounded-[40px] p-10 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-[#0a0e17] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-black text-white mb-2 tracking-wide">باركود الدعوة</h3>
              <p className="text-gray-500 text-[10px] font-bold mb-8 text-center px-4">امسح الباركود للانضمام إلى فريقي وبدء العمل</p>

              <div className="p-4 bg-white rounded-[24px] shadow-2xl border border-white/10 mb-8 relative" id="qr-code-to-download">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/signup?ref=${user.invitationCode || user.id}`)}`} 
                  alt="QR Code" 
                  id="qr-image"
                  className="w-48 h-48 relative z-10 mix-blend-multiply"
                />
              </div>

              <div className="flex flex-col items-center gap-1 mb-6">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">REFFERAL CODE</span>
                <span className="text-2xl font-black font-mono text-white tracking-widest">{user.invitationCode || user.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  onClick={() => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`${window.location.origin}/signup?ref=${user.invitationCode || user.id}`)}`;
                    window.open(qrUrl, '_blank');
                    toast.success('جاري فتح صورة الباركود للحفظ');
                  }}
                  className="bg-[#0a0e17] text-gray-300 border border-white/10 py-3.5 rounded-xl font-bold hover:bg-white/5 active:scale-95 transition-all text-[11px]"
                >
                  حفظ الصورة
                </button>
                <button 
                  onClick={() => {
                    const refLink = `${window.location.origin}/signup?ref=${user.invitationCode || user.id}`;
                    navigator.clipboard.writeText(refLink);
                    toast.success('تم نسخ الرابط');
                  }}
                  className="bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 transition-all text-[11px] border border-blue-500/50"
                >
                  نسخ الرابط
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modals */}

      {/* Wallet Modal */}
      <AnimatePresence>
        {walletModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setWalletModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#131b2c] rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <h3 className="text-xl font-black text-white mb-6 text-center tracking-wide">بيانات السحب</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">عنوان المحفظة (USDT)</label>
                  <input type="text" value={walletModal.address} onChange={e => setWalletModal(prev => ({ ...prev, address: e.target.value }))} className="w-full bg-[#0a0e17] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-mono outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 text-white transition-all shadow-inner placeholder-gray-700" placeholder="0x..." dir="ltr" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">الشبكة</label>
                  <select value={walletModal.network} onChange={e => setWalletModal(prev => ({ ...prev, network: e.target.value }))} className="w-full bg-[#0a0e17] border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 transition-all shadow-inner appearance-none relative">
                    <option value="TRC20-USDT" className="bg-[#131b2c] text-white">TRC20-USDT</option>
                    <option value="BEP20-USDT" className="bg-[#131b2c] text-white">BEP20-USDT</option>
                    <option value="ERC20-USDT" className="bg-[#131b2c] text-white">ERC20-USDT</option>
                    <option value="Polygon-USDT" className="bg-[#131b2c] text-white">Polygon (USDT)</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={handleWalletSave} className="flex-1 bg-gradient-to-l from-blue-600 to-blue-500 text-white rounded-xl py-3.5 font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20 border border-blue-400/30">حفظ العنوان</button>
                <button onClick={() => setWalletModal(prev => ({ ...prev, isOpen: false }))} className="bg-[#0a0e17] text-gray-400 px-6 rounded-xl py-3.5 font-bold text-sm hover:text-white border border-white/5 active:scale-95 transition-all">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Security Modal */}
      <AnimatePresence>
        {securityModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#131b2c] rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <h3 className="text-xl font-black text-white mb-6 text-center tracking-wide">تغيير كلمة المرور</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">كلمة المرور الحالية</label>
                  <input type="password" value={securityModal.oldPass} onChange={e => setSecurityModal(prev => ({ ...prev, oldPass: e.target.value }))} className="w-full bg-[#0a0e17] border border-white/5 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 text-white transition-all shadow-inner placeholder-gray-700" placeholder="••••••••" dir="ltr" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-2">كلمة المرور الجديدة</label>
                  <input type="password" value={securityModal.newPass} onChange={e => setSecurityModal(prev => ({ ...prev, newPass: e.target.value }))} className="w-full bg-[#0a0e17] border border-white/5 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 text-white transition-all shadow-inner placeholder-gray-700" placeholder="••••••••" dir="ltr" />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={handleSecuritySave} className="flex-1 bg-gradient-to-l from-blue-600 to-blue-500 text-white rounded-xl py-3.5 font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-500/20 border border-blue-400/30">تأكيد التغيير</button>
                <button onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))} className="bg-[#0a0e17] text-gray-400 px-6 rounded-xl py-3.5 font-bold text-sm hover:text-white border border-white/5 active:scale-95 transition-all">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reward Modal */}
      <AnimatePresence>
        {rewardModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRewardModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#131b2c] rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <div className="w-20 h-20 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <Gift size={36} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 text-center tracking-wide">كود المكافأة</h3>
              <p className="text-[11px] text-gray-500 font-bold text-center mb-6">أدخل كود الهدية للحصول على رصيد إضافي</p>
              
              <div>
                <input type="text" placeholder="أدخل الكود..." value={rewardModal.code} onChange={e => setRewardModal(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} className="w-full bg-[#0a0e17] border border-white/10 rounded-2xl px-4 py-4 text-center text-xl tracking-widest font-black uppercase outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500/50 text-white placeholder-gray-700 shadow-inner transition-all" dir="ltr" />
              </div>
              
              <div className="mt-8 flex flex-col gap-3">
                <button onClick={handleRewardSubmit} className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-xl py-4 font-bold text-sm active:scale-95 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] border border-pink-400/50">استلام المكافأة الآن</button>
                <button onClick={() => setRewardModal(prev => ({ ...prev, isOpen: false }))} className="w-full bg-transparent text-gray-500 hover:text-gray-300 py-3 font-bold text-sm transition-colors">إغلاق</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

