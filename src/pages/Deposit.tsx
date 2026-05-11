import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Copy, CheckCircle, Info, QrCode, ArrowRight } from 'lucide-react';
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

      // Reset displayed address when changing tabs
      setUserDepositAddress('');

      const savedAddress = databaseService.getNowPaymentsAddress(user.id, selectedCurrency.id);
      if (savedAddress) {
        setUserDepositAddress(savedAddress);
        return;
      }

      setIsLoadingAddress(true);
      try {
        let nowpCurrency = selectedCurrency.name.toLowerCase();
        if (selectedCurrency.network.includes('TRC20')) nowpCurrency = 'usdttrc20';
        if (selectedCurrency.network.includes('ERC20')) nowpCurrency = 'usdterc20';
        if (selectedCurrency.network.includes('BEP20')) nowpCurrency = 'usdtbsc';
        if (selectedCurrency.network.toLowerCase().includes('polygon')) nowpCurrency = 'usdtmatic';
        if (selectedCurrency.network.toLowerCase() === 'aptos') nowpCurrency = 'apt';
        if (selectedCurrency.network.toLowerCase() === 'btc') nowpCurrency = 'btc';

        const response = await fetch('/api/nowpayments/deposit-address', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currency: nowpCurrency,
            order_id: `dep_${user.id}_${Date.now()}`,
            order_description: `Deposit for user ${user.id}`
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || data.error || 'فشل في توليد عنوان الدفع من NOWPayments');
        }

        const newAddress = data.pay_address;
        setUserDepositAddress(newAddress);
        databaseService.setNowPaymentsAddress(user.id, selectedCurrency.id, newAddress);
        
      } catch (error: any) {
        toast.error('حدثت مشكلة في توليد عنوان جديد للعملة، يرجى المحاولة لاحقاً');
        console.error(error);
      } finally {
        setIsLoadingAddress(false);
      }
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
    <div className="min-h-screen bg-[#fcfdfe] pb-12 font-sans text-right" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="flex items-center">
           <Link to="/home" className="p-3 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 transition-colors ml-4">
             <ChevronLeft size={20} />
           </Link>
           <h1 className="text-xl font-black text-gray-900 tracking-tight flex-1 text-center pr-10">شحن المحفظة</h1>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-4">
            <Info size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">يرجى قراءة التعليمات بعناية</span>
          </div>
          <h2 className="text-lg font-black text-gray-800">اختر العملة المراد شحنها</h2>
          <p className="text-[11px] text-gray-400 font-bold mt-2 leading-relaxed">
            تأكد من اختيار الشبكة الصحيحة قبل إرسال العملات. أي خطأ قد يؤدي لفقدان الأموال نهائياً.
          </p>
        </div>

        {/* Currency Selector */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {currencies.map((curr) => (
            <motion.button 
              key={curr.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCurrency(curr)}
              className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${
                selectedCurrency?.id === curr.id 
                  ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/5' 
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg overflow-hidden ${
                selectedCurrency?.id === curr.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 text-gray-400'
              }`}>
                {curr.iconUrl ? (
                  <img src={curr.iconUrl} alt={curr.name} className="w-full h-full object-cover" />
                ) : (
                  curr.name[0]
                )}
              </div>
              <div className="text-center">
                <span className="text-sm font-black text-gray-800 block">{curr.name}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{curr.network}</span>
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
              className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-2xl shadow-blue-500/5"
            >
              <div className="flex flex-col items-center">
                <div className="w-full space-y-6">
                  <div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2 mr-2">شبكة الإيداع (Network)</span>
                    <div className="bg-gray-50 px-6 py-4 rounded-[22px] border border-gray-100 text-gray-800 font-black text-sm">
                      {selectedCurrency.network}
                    </div>
                  </div>

                  {isLoadingAddress ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-gray-400">جاري توليد عنوان خاص بك...</span>
                    </div>
                  ) : userDepositAddress ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-white border border-gray-100 rounded-[32px] shadow-sm mb-4 mt-2">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${userDepositAddress}`} alt="QR Code" className="w-[180px] h-[180px] object-contain" />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2 mr-2">عنوان المحفظة الخاص بك (Address)</span>
                        <div className="relative group">
                          <div className="bg-gray-50 pr-6 pl-14 py-5 rounded-[22px] border border-gray-100 text-blue-600 font-bold text-[13px] break-all leading-relaxed shadow-inner">
                            {userDepositAddress}
                          </div>
                          <button 
                            onClick={handleCopy}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm active:scale-90 transition-all hover:bg-gray-50"
                          >
                            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-8 text-center text-red-500 font-bold text-sm">
                      تعذر جلب العنوان، يرجى المحاولة مرة أخرى لاحقاً.
                    </div>
                  )}
                </div>

                <div className="mt-10 w-full pt-8 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed text-center italic">
                    * هذا العنوان مخصص لك فقط. يمكنك إرسال أية مبالغ إليه وسيتم إضافتها تلقائياً إلى رصيدك.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
