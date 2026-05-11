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
    <div className="min-h-screen bg-[#fcfdfe] pb-12 font-sans text-right relative overflow-hidden" dir="rtl">
      {/* Pending process Overlay */}
      <AnimatePresence>
        {showActiveError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[48px] shadow-2xl shadow-blue-900/10 text-center border border-white max-w-xs w-full"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">لم تكتمل العملية الاولى</h3>
              <p className="text-[11px] text-gray-400 font-bold leading-relaxed mb-8">يجب انتظار انتهاء العملية السابقة قبل تقديم طلب سحب جديد.</p>
              <button 
                onClick={() => setShowActiveError(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs"
              >
                حسناً، فهمت
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex items-center">
           <Link to="/home" className="p-3 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 transition-colors ml-4">
             <ChevronLeft size={20} />
           </Link>
           <h1 className="text-xl font-black text-gray-900 tracking-tight flex-1 text-center pr-10">سحب الأرباح</h1>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-[40px] p-8 text-white mb-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
           <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">رصيدك القابل للسحب</span>
              <div className="text-4xl font-black mt-2 tracking-tighter">${user?.balance.toFixed(2)}</div>
           </div>
           <Wallet className="absolute -bottom-4 -left-4 w-32 h-32 opacity-10" />
        </div>

        <div className="space-y-8">
           <div>
              <div className="flex justify-between items-end mb-4 mr-2">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">المبلغ المراد سحبه ($)</label>
                <button onClick={handleWithdrawAll} className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">سحب الكل</button>
              </div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full py-5 px-8 bg-gray-50 border border-gray-100 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-black text-xl text-blue-600 transition-all"
              />
              {amount && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                   <div className="flex justify-between text-[11px] font-bold text-gray-400">
                      <span>رسوم السحب ({withdrawalCommission}%):</span>
                      <span className="text-rose-500">-${getFeeAmount().toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm font-black text-gray-800">
                      <span>المبلغ الصافي المستلم:</span>
                      <span className="text-blue-600">${getFinalAmount().toFixed(2)}</span>
                   </div>
                </motion.div>
              )}
           </div>

           <div>
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-4 mr-2">شبكة السحب</label>
              <div className="grid grid-cols-2 gap-4">
                 {['TRC20', 'ERC20'].map(net => (
                   <button 
                    key={net}
                    onClick={() => setNetwork(net)}
                    className={`py-4 rounded-2xl border-2 font-black text-xs transition-all ${
                      network === net ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 bg-white text-gray-400'
                    }`}
                   >
                     {net}
                   </button>
                 ))}
              </div>
           </div>

           <div>
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-4 mr-2">عنوان المحفظة الخاص بك</label>
              <input 
                type="text" 
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="أدخل عنوان المحفظة بعناية..."
                className="w-full py-5 px-8 bg-gray-50 border border-gray-100 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold text-sm transition-all"
              />
           </div>

           <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                 <ShieldCheck size={20} />
                 <span className="text-[13px] font-black">قواعد الأمان والخصوصية</span>
              </div>
              <ul className="space-y-2">
                 {[
                   withdrawalDelay === 0 ? 'تتم عملية المراجعة وتحويل الأموال فورياً.' : `تستغرق عملية معالجة السحب حوالي ${withdrawalDelay} ساعة.`,
                   'يرجى التأكد بنسبة 100% من عنوان المحفظة.',
                   'الحد الأدنى للسحب هو 10 $.',
                   `سيتم خصم عمولة ثابتة قدرها ${withdrawalCommission}% لكل عملية.`,
                   'لا يمكنك تقديم طلب جديد قبل اكتمال الطلب السابق.'
                 ].map((rule, i) => (
                   <li key={i} className="text-[10px] text-amber-700/70 font-bold flex items-center gap-2">
                      <div className="w-1 h-1 bg-amber-400 rounded-full" /> {rule}
                   </li>
                 ))}
              </ul>
           </div>

           <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWithdraw}
            disabled={isLoading || !amount || !walletAddress}
            className={`w-full py-6 rounded-[32px] font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all ${
              isLoading || !amount || !walletAddress ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white shadow-blue-600/30'
            }`}
           >
             {isLoading ? (
               <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <>تأكيد طلب السحب <Clock size={22} /></>
             )}
           </motion.button>
        </div>
      </div>
    </div>
  );
}
