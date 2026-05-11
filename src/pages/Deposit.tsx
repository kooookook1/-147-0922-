import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Copy, CheckCircle, Info, QrCode, ArrowRight, X } from 'lucide-react';
import { databaseService, Currency } from '../services/databaseService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Deposit() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [userDepositAddress, setUserDepositAddress] = useState<string>('');

  useEffect(() => {
    const data = databaseService.getCurrencies().filter(c => c.isActive);
    setCurrencies(data);
    if (data.length > 0) setSelectedCurrency(data[0]);
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!selectedCurrency) return;
      
      const user = databaseService.getCurrentUser();
      if (!user) return;

      setUserDepositAddress(selectedCurrency.address);
    };
    
    fetchAddress();
  }, [selectedCurrency]);

  const handleCopy = () => {
    if (!userDepositAddress) return;
    navigator.clipboard.writeText(userDepositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] pb-12 font-sans text-right relative overflow-x-hidden" dir="rtl">
      
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0e17] to-transparent"></div>
      </div>

      {/* Header */}
      <div className="bg-[#131b2c] px-6 pt-8 pb-6 border-b border-white/5 shadow-inner sticky top-0 z-30 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex items-center relative z-10">
           <Link to="/home" className="p-3 bg-[#0a0e17] rounded-xl text-gray-400 hover:text-white border border-white/5 hover:border-white/10 transition-colors ml-4 shadow-inner">
             <ChevronLeft size={20} />
           </Link>
           <h1 className="text-xl font-black text-white tracking-widest flex-1 text-center pr-10">شحن الرصيد</h1>
        </div>
      </div>

      <div className="p-6 relative z-10">
        <div className="mb-10 text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full mb-6 shadow-inner">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">اختر شبكة الإيداع الخاصة بك</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-wide">العملات المدعومة</h2>
          <p className="text-[11px] text-gray-500 font-bold mt-3 leading-relaxed px-4">
            تأكد من اختيار الشبكة الصحيحة قبل إرسال العملات. هذا العنوان مخصص لك فقط ويمكنك الإيداع عليه عدة مرات.
          </p>
        </div>

        {/* Currency Selector */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {currencies.map((curr) => (
            <motion.button 
              key={curr.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCurrency(curr)}
              className={`p-6 rounded-[24px] border transition-all flex flex-col items-center gap-4 relative overflow-hidden ${
                selectedCurrency?.id === curr.id 
                  ? 'border-blue-500/50 bg-[#131b2c] shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                  : 'border-white/5 bg-[#131b2c]/50 hover:bg-[#131b2c]'
              }`}
            >
              {selectedCurrency?.id === curr.id && (
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
              )}
              <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center font-black text-lg shadow-inner z-10 ${
                selectedCurrency?.id === curr.id ? 'bg-blue-600/20 text-blue-400 p-2.5' : 'bg-[#0a0e17] text-gray-500 border border-white/5 p-2.5'
              }`}>
                {curr.iconUrl ? (
                  <img src={curr.iconUrl} alt={curr.name} className="w-full h-full object-contain drop-shadow-lg" />
                ) : (
                  curr.name[0]
                )}
              </div>
              <div className="text-center z-10">
                <span className={`text-sm font-black block mb-1 tracking-wide ${selectedCurrency?.id === curr.id ? 'text-white' : 'text-gray-300'}`}>{curr.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedCurrency?.id === curr.id ? 'text-blue-400' : 'text-gray-600'}`}>{curr.network}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedCurrency && (
            <motion.div 
              key={selectedCurrency.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#131b2c] rounded-[32px] border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-600 to-emerald-400" />
              <div className="flex flex-col items-center relative z-10">
                <div className="w-full space-y-8">
                  <div className="flex justify-between items-center bg-[#0a0e17] p-4 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">شبكة التحويل</span>
                    <span className="text-white font-black text-sm tracking-wide bg-white/5 px-4 py-1.5 rounded-lg border border-white/10">
                      {selectedCurrency.network}
                    </span>
                  </div>

                  {isLoadingAddress ? (
                    <div className="py-16 flex flex-col items-center justify-center space-y-6">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-[#0a0e17] rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <span className="text-[13px] font-black tracking-widest text-blue-400 translate-x-2">جاري توليد العنوان...</span>
                    </div>
                  ) : userDepositAddress ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-8">
                      <div className="flex flex-col items-center">
                        <div className="p-5 bg-white rounded-[32px] shadow-[0_0_40px_rgba(59,130,246,0.2)] mb-2 relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-[34px] blur opacity-30"></div>
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userDepositAddress}`} alt="QR Code" className="w-[200px] h-[200px] object-contain relative mix-blend-multiply" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                          عنوان الإيداع الخاص بك <ArrowRight size={14} className="text-blue-500" />
                        </span>
                        <div className="relative group">
                          <div className="bg-[#0a0e17] pr-6 pl-16 py-5 rounded-[24px] border border-blue-500/20 text-blue-400 font-mono font-bold text-[12px] sm:text-[13px] break-all shadow-inner relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0e17] to-transparent pointer-events-none z-10" />
                            <span className="relative z-0 select-all">{userDepositAddress}</span>
                          </div>
                          <button 
                            onClick={handleCopy}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 shadow-sm active:scale-90 transition-all hover:bg-blue-600 hover:text-white z-20"
                          >
                            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-12 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                         <X size={32} />
                      </div>
                      <span className="text-red-400 font-bold text-sm tracking-wide">تعذر جلب العنوان!</span>
                      <span className="text-gray-500 text-[11px] mt-2">يرجى المحاولة مرة أخرى لاحقاً أو التحقق من الاتصال.</span>
                    </div>
                  )}
                </div>

                <div className="mt-10 w-full pt-6 border-t border-white/5">
                  <div className="flex items-start gap-3 bg-[#0a0e17] p-4 rounded-2xl border border-rose-500/10">
                    <Info size={20} className="text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed text-right">
                      هذا العنوان مخصص لإيداع عملة <span className="text-white mx-1">{selectedCurrency.name}</span> عبر شبكة <span className="text-white mx-1">{selectedCurrency.network}</span> فقط. إرسال أي عملات أخرى قد يؤدي إلى فقدانها بشكل دائم.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
