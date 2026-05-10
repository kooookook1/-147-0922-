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
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const data = databaseService.getCurrencies().filter(c => c.isActive);
    setCurrencies(data);
    if (data.length > 0) setSelectedCurrency(data[0]);
  }, []);

  const handleCopy = () => {
    if (!selectedCurrency) return;
    navigator.clipboard.writeText(selectedCurrency.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (!selectedCurrency || !amount || parseFloat(amount) <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    const user = databaseService.getCurrentUser();
    if (!user) return;

    setIsSubmitting(true);
    
    databaseService.createTransaction({
      userId: user.id,
      amount: parseFloat(amount),
      type: 'deposit',
      status: 'pending',
      currencyId: selectedCurrency.id
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setAmount('');
      toast.success('تم إرسال الطلب بنجاح. سنقوم بمراجعة العملية وإضافة الرصيد قريباً.');
    }, 1500);
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
                {/* QR Code */}
                <div className="p-4 bg-white border border-gray-100 rounded-[32px] shadow-sm mb-8">
                  <img src={selectedCurrency.qrUrl} alt="QR Code" className="w-[180px] h-[180px] object-contain" />
                </div>

                <div className="w-full space-y-6">
                  <div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2 mr-2">مبلغ الإيداع (USDT)</span>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-50 px-6 py-4 rounded-[22px] border border-gray-100 text-gray-800 font-black text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2 mr-2">شبكة الإيداع (Network)</span>
                    <div className="bg-gray-50 px-6 py-4 rounded-[22px] border border-gray-100 text-gray-800 font-black text-sm">
                      {selectedCurrency.network}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2 mr-2">عنوان المحفظة (Address)</span>
                    <div className="relative group">
                      <div className="bg-gray-50 pr-6 pl-14 py-5 rounded-[22px] border border-gray-100 text-gray-600 font-bold text-[11px] break-all leading-relaxed">
                        {selectedCurrency.address}
                      </div>
                      <button 
                        onClick={handleCopy}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm active:scale-90 transition-all"
                      >
                        {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-5 rounded-[22px] font-black text-sm shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4"
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'قمت بالدفع، تأكيد العملية'}
                  </button>
                </div>

                <div className="mt-10 w-full pt-8 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed text-center italic">
                    * يرجى إرسال المبلغ بالضبط إلى العنوان أعلاه ثم الضغط على زر التأكيد. سنقوم بمراجعة العملية وإضافة الرصيد لمحفظتك خلال دقائق.
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
