import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Wallet, ArrowLeft, ShieldCheck, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { databaseService, User } from '../services/databaseService';
import { Link, useNavigate } from 'react-router-dom';

export default function Withdraw() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [withdrawalCommission, setWithdrawalCommissionRate] = useState(19);
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showActiveError, setShowActiveError] = useState(false);
  const [withdrawalDelay, setWithdrawalDelay] = useState(24);

  useEffect(() => {
    const currentUser = databaseService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    if (currentUser.walletAddress) setWalletAddress(currentUser.walletAddress);
    setWithdrawalCommissionRate(databaseService.getWithdrawalCommission());
    setWithdrawalDelay(databaseService.getWithdrawalDelayHours());
  }, [navigate]);

  const getFeeAmount = () => {
    const val = parseFloat(amount) || 0;
    return (val * withdrawalCommission) / 100;
  };

  const getFinalAmount = () => {
    const val = parseFloat(amount) || 0;
    return val - getFeeAmount();
  };

  const handleWithdrawAll = () => {
    if (user) setAmount(user.balance.toString());
  };

  const handleWithdraw = () => {
    if (!user || !amount || !walletAddress) return;
    
    // Check for pending withdrawal
    const hasPending = databaseService.hasPendingWithdrawal(user.id);
    if (hasPending) {
      setShowActiveError(true);
      setTimeout(() => setShowActiveError(false), 3000);
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount < 10) {
      toast.error('الحد الأدنى للسحب هو 10 دولارات');
      return;
    }
    
    if (numAmount > user.balance) {
      alert('رصيدك غير كافٍ');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create transaction
      databaseService.createTransaction({
        userId: user.id,
        amount: numAmount,
        fee: getFeeAmount(),
        netAmount: getFinalAmount(),
        type: 'withdrawal',
        networkAddress: walletAddress,
        walletNetwork: network,
      });

      // Update user balance
      databaseService.updateCurrentUser({
        balance: user.balance - numAmount,
        walletAddress,
        walletNetwork: network
      });

      setIsLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fcfdfe] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20"
        >
          <CheckCircle size={48} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-800 mb-4">تم إرسال طلبك بنجاح!</h2>
        <p className="text-gray-400 font-bold text-sm mb-12 leading-relaxed max-w-xs">
          طلبك الآن قيد المراجعة الإدارية. تستغرق العملية عادة من 24 إلى 72 ساعة كحد أقصى.
        </p>
        <button 
          onClick={() => navigate('/home')}
          className="w-full max-w-md py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] pb-12 font-sans text-right relative overflow-hidden" dir="rtl">
      
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0e17] to-transparent"></div>
      </div>

      {/* Pending process Overlay */}
      <AnimatePresence>
        {showActiveError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#131b2c] p-10 rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 text-center max-w-xs w-full"
            >
              <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-wide">طلب سحب قيد الانتظار</h3>
              <p className="text-[11px] text-gray-400 font-bold leading-relaxed mb-8">يجب انتظار انتهاء العملية السابقة قبل تقديم طلب سحب جديد.</p>
              <button 
                onClick={() => setShowActiveError(false)}
                className="w-full py-4 bg-[#0a0e17] hover:bg-white/5 border border-white/5 hover:border-white/10 text-white rounded-xl font-bold text-xs transition-colors"
              >
                حسناً، فهمت
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#131b2c] px-6 pt-8 pb-6 border-b border-white/5 shadow-inner sticky top-0 z-30 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex items-center relative z-10">
           <Link to="/home" className="p-3 bg-[#0a0e17] rounded-xl text-gray-400 hover:text-white border border-white/5 hover:border-white/10 transition-colors ml-4 shadow-inner">
             <ChevronLeft size={20} />
           </Link>
           <h1 className="text-xl font-black text-white tracking-widest flex-1 text-center pr-10">سحب الأموال</h1>
        </div>
      </div>

      <div className="p-6 relative z-10">
        <div className="bg-[#1a2333] border border-white/10 rounded-[32px] p-8 text-white mb-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-400" />
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[30px]" />
           
           <div className="relative z-10">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest block mb-2">رصيدك القابل للسحب (USDT)</span>
              <div className="text-4xl font-black tracking-widest font-mono text-white textShadow-sm">${user?.balance.toFixed(2)}</div>
           </div>
           <Wallet className="absolute -bottom-6 -left-6 w-32 h-32 text-blue-500/5 mix-blend-plus-lighter" />
        </div>

        <div className="space-y-6">
           {/* Amount */}
           <div className="bg-[#131b2c] p-6 rounded-[32px] border border-white/5 shadow-inner">
              <div className="flex justify-between items-end mb-4 mr-2">
                <label className="text-[11px] text-gray-500 font-bold uppercase tracking-widest block">المبلغ المراد سحبه ($)</label>
                <button onClick={handleWithdrawAll} className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">سحب الكل</button>
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full py-4 px-6 bg-[#0a0e17] border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 font-black text-xl font-mono text-blue-400 transition-all placeholder-gray-700 shadow-inner"
              />
              <AnimatePresence>
                {amount && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                     <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                       <div className="flex justify-between text-[11px] font-bold text-gray-500">
                          <span>رسوم السحب ({withdrawalCommission}%):</span>
                          <span className="text-rose-400 font-mono">-${getFeeAmount().toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between text-[13px] font-black text-white">
                          <span>المبلغ الصافي المستلم:</span>
                          <span className="text-emerald-400 font-mono">${getFinalAmount().toFixed(2)}</span>
                       </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* Network */}
           <div className="bg-[#131b2c] p-6 rounded-[32px] border border-white/5 shadow-inner">
              <label className="text-[11px] text-gray-500 font-bold uppercase tracking-widest block mb-4 mr-2">شبكة التحويل</label>
              <div className="grid grid-cols-2 gap-3">
                 {['TRC20', 'ERC20', 'BEP20', 'Polygon', 'BTC'].map(net => (
                   <button 
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      network === net 
                        ? 'border border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                        : 'border border-white/5 bg-[#0a0e17] text-gray-500 hover:bg-white/5'
                    }`}
                   >
                     {net}
                   </button>
                 ))}
              </div>
           </div>

           {/* Address */}
           <div className="bg-[#131b2c] p-6 rounded-[32px] border border-white/5 shadow-inner">
              <label className="text-[11px] text-gray-500 font-bold uppercase tracking-widest block mb-4 mr-2">عنوان المحفظة (USDT)</label>
              <input 
                type="text" 
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="أدخل عنوان المحفظة بعناية..."
                className="w-full py-4 px-6 bg-[#0a0e17] border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 font-bold text-sm text-white transition-all placeholder-gray-700 shadow-inner"
                dir="ltr"
              />
           </div>

           {/* Rules */}
           <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3 text-amber-500">
                 <ShieldCheck size={20} />
                 <span className="text-[13px] font-black tracking-wide">قواعد الأمان والخصوصية</span>
              </div>
              <ul className="space-y-3">
                 {[
                   withdrawalDelay === 0 ? 'تتم عملية المراجعة وتحويل الأموال فورياً.' : `تستغرق عملية معالجة السحب حوالي ${withdrawalDelay} ساعة.`,
                   'يرجى التأكد بنسبة 100% من عنوان المحفظة والشبكة.',
                   'الحد الأدنى للسحب هو 10 دولار (USDT).',
                   `سيتم خصم عمولة صيانة وثبات الخادم ${withdrawalCommission}% لكل عملية.`,
                   'لا يمكنك تقديم طلب أخر قبل اكتمال الطلب السابق.'
                 ].map((rule, i) => (
                   <li key={i} className="text-[11px] text-amber-400/80 font-bold flex items-start gap-2 leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_5px_rgba(245,158,11,0.5)]" /> 
                      <span className="flex-1">{rule}</span>
                   </li>
                 ))}
              </ul>
           </div>

           <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWithdraw}
            disabled={isLoading || !amount || !walletAddress}
            className={`w-full py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all ${
              isLoading || !amount || !walletAddress 
                ? 'bg-[#131b2c] text-gray-600 border border-white/5' 
                : 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 active:scale-95'
            }`}
           >
             {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <>تأكيد طلب السحب <Clock size={18} /></>
             )}
           </motion.button>
        </div>
      </div>
    </div>
  );
}
