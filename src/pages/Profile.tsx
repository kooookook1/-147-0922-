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
    <div className="bg-[#fcfdfe] min-h-screen pb-24 font-sans text-right overflow-x-hidden" dir="rtl">
      {/* Header and User Info Top */}
      <div className="bg-[#4285F4] text-white pt-12 pb-16 px-6" dir="ltr">
        <div className="flex items-center justify-center gap-3">
           <div className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center overflow-hidden shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile" className="w-[38px] h-[38px] object-contain rounded-full bg-blue-50" />
           </div>
           <span className="text-[16px] font-medium tracking-widest">{maskPhone(user.phoneNumber || user.id)}</span>
           <span className="text-[16px] font-bold text-emerald-300">{getRankLetter(user.vipLevel)}</span>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="relative bg-gradient-to-b from-[#f8fbff] to-[#f0f7ff] pt-4 pb-5 px-5 rounded-[16px] shadow-sm mx-3 -mt-10 mb-5 border border-white">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[#3b82f6] font-medium text-[13px]">الارباح</span>
          <span className="text-gray-700 font-medium text-[13px]">100</span>
        </div>
        
        <div className="flex items-center justify-between gap-4 mb-5">
          {/* Progress bar */}
          <div className="flex-1 h-2 bg-[#1e3a8a] rounded-l-full overflow-hidden flex relative transform -skew-x-[20deg]" dir="ltr">
            <div className="w-[85%] h-full bg-[#3b82f6] relative" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 6px, transparent 6px, transparent 12px)' }}></div>
          </div>
          <span className="text-2xl font-bold text-[#1e3a8a] tracking-tight leading-none min-w-max" dir="ltr">{formatBalance(user.balance)}</span>
        </div>

        <div className="grid grid-cols-3 gap-y-4 text-center mt-2">
           <div className="flex flex-col border-l border-blue-100">
              <span className="text-[11px] font-medium text-gray-800 mb-1">مكافأة الإحالة الداخلية</span>
              <span className="text-base font-bold text-[#1e3a8a]" dir="ltr">{formatBalance(user.invitations * 10)}</span>
           </div>
           <div className="flex flex-col border-l border-blue-100">
              <span className="text-[11px] font-medium text-gray-800 mb-1">إجمالي دخل المهمة</span>
              <span className="text-base font-bold text-[#1e3a8a]" dir="ltr">{getTotalTaskIncome()}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-800 mb-1">دخل مهمة اليوم</span>
              <span className="text-base font-bold text-[#1e3a8a]" dir="ltr">{getTodayTaskIncome()}</span>
           </div>
        </div>

        <div className="grid grid-cols-2 text-center mt-4 pt-4 border-t border-blue-100">
           <div className="flex flex-col border-l border-blue-100">
              <span className="text-[11px] font-medium text-gray-800 mb-1">يوم العمل الفعال</span>
              <span className="text-base font-bold text-[#1e3a8a]" dir="ltr">{calculateActiveDays(user.joinedAt)}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-800 mb-1">إجمالي الإيرادات</span>
              <span className="text-base font-bold text-[#1e3a8a]" dir="ltr">{calculateTotalRevenues()}</span>
           </div>
        </div>
      </div>
      
      {/* Modern Settings List */}
      <div className="px-4 space-y-4">
        {/* Main List */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
          {[
            { icon: UploadCloud, label: 'شحن الحساب', iconBg: 'bg-gradient-to-br from-yellow-300 to-amber-500', path: '/deposit', action: null },
            { icon: DownloadCloud, label: 'سحب', iconBg: 'bg-gradient-to-br from-emerald-300 to-emerald-500', path: '/withdraw', action: null },
            { icon: Smile, label: 'توظيف الموظفين', iconBg: 'bg-gradient-to-br from-green-300 to-emerald-400', path: '#', action: () => setShowQR(true) },
            { icon: Landmark, label: 'عنوان المحفظة', iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600', path: '#', action: () => setWalletModal(prev => ({ ...prev, isOpen: true })) },
            { icon: CreditCard, label: 'سجل الايداع', iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600', path: '/record?category=finance&tab=deposit', action: null },
            { icon: FileText, label: 'سجل السحب', iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600', path: '/record?category=finance&tab=withdrawal', action: null },
          ].map((item, idx, arr) => (
            <motion.div 
              key={idx}
              whileHover={{ backgroundColor: '#fafafa' }}
              onClick={() => {
                 if (item.action) item.action();
                 else if (item.path !== '#') navigate(item.path);
              }}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${idx !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 ${item.iconBg} rounded-full flex items-center justify-center shadow-md shadow-black/5`}>
                  <item.icon size={16} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-[15px] font-medium text-[#1e3a8a]">{item.label}</span>
              </div>
              <ChevronLeft size={18} className="text-[#1e3a8a]" />
            </motion.div>
          ))}
        </div>

        {/* Secondary List */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
          {[
            { icon: ShieldCheck, label: 'مركز الأمان', iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600', path: '#', action: () => setSecurityModal(prev => ({ ...prev, isOpen: true })) },
            { icon: Gift, label: 'صندوق المكافآت', iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600', path: '#', action: () => setRewardModal(prev => ({ ...prev, isOpen: true })) },
            { icon: LogOut, label: 'تسجيل الخروج', iconBg: 'bg-gradient-to-br from-red-400 to-red-600', path: '#', action: handleLogout },
          ].map((item, idx, arr) => (
            <motion.div 
              key={idx}
              whileHover={{ backgroundColor: '#fafafa' }}
              onClick={() => {
                 if (item.action) item.action();
                 else if (item.path !== '#') navigate(item.path);
              }}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${idx !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 ${item.iconBg} rounded-full flex items-center justify-center shadow-md shadow-black/5`}>
                  <item.icon size={16} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-[15px] font-medium text-[#1e3a8a]">{item.label}</span>
              </div>
              <ChevronLeft size={18} className="text-[#1e3a8a]" />
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
      {/* Modals */}

      {/* Wallet Modal */}
      <AnimatePresence>
        {walletModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setWalletModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl"
            >
              <h3 className="text-xl font-black text-gray-900 mb-6 text-center">بيانات المحفظة</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">عنوان محفظة السحب</label>
                  <input type="text" value={walletModal.address} onChange={e => setWalletModal(prev => ({ ...prev, address: e.target.value }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500" placeholder="0x..." dir="ltr" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">شبكة المحفظة</label>
                  <select value={walletModal.network} onChange={e => setWalletModal(prev => ({ ...prev, network: e.target.value }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="TRC20-USDT">TRC20-USDT</option>
                    <option value="BEP20-USDT">BEP20-USDT</option>
                    <option value="ERC20-USDT">ERC20-USDT</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={handleWalletSave} className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-black text-sm active:scale-95 transition-all">حفظ البيانات</button>
                <button onClick={() => setWalletModal(prev => ({ ...prev, isOpen: false }))} className="bg-gray-100 text-gray-600 px-6 rounded-xl py-3 font-black text-sm active:scale-95 transition-all">إلغاء</button>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl"
            >
              <h3 className="text-xl font-black text-gray-900 mb-6 text-center">مركز الأمان</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">كلمة المرور القديمة</label>
                  <input type="password" value={securityModal.oldPass} onChange={e => setSecurityModal(prev => ({ ...prev, oldPass: e.target.value }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500" dir="ltr" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">كلمة المرور الجديدة</label>
                  <input type="password" value={securityModal.newPass} onChange={e => setSecurityModal(prev => ({ ...prev, newPass: e.target.value }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500" dir="ltr" />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={handleSecuritySave} className="flex-1 bg-amber-500 text-white rounded-xl py-3 font-black text-sm active:scale-95 transition-all shadow-lg shadow-amber-500/20">تغيير كلمة المرور</button>
                <button onClick={() => setSecurityModal(prev => ({ ...prev, isOpen: false }))} className="bg-gray-100 text-gray-600 px-6 rounded-xl py-3 font-black text-sm active:scale-95 transition-all">إلغاء</button>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Gift size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 text-center">صندوق المكافآت</h3>
              <p className="text-xs text-gray-400 text-center mb-6">أدخل كود المكافأة اليومي للحصول على هديتك</p>
              
              <div>
                <input type="text" placeholder="أدخل الكود هنا..." value={rewardModal.code} onChange={e => setRewardModal(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-center text-xl tracking-widest font-black uppercase outline-none focus:ring-2 focus:ring-rose-500" dir="ltr" />
              </div>
              
              <div className="mt-8 flex gap-3">
                <button onClick={handleRewardSubmit} className="flex-1 bg-rose-500 text-white rounded-xl py-3 font-black text-sm active:scale-95 transition-all shadow-lg shadow-rose-500/20">استلام المكافأة</button>
                <button onClick={() => setRewardModal(prev => ({ ...prev, isOpen: false }))} className="bg-gray-100 text-gray-600 px-6 rounded-xl py-3 font-black text-sm active:scale-95 transition-all">إلغاء</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

