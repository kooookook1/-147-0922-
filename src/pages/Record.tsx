import { useState, useEffect, ChangeEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ClipboardList, Filter, Calendar, Sparkles, Plus, CreditCard, Image as ImageIcon, CheckCircle2, ExternalLink, Clock, Youtube, Play, Facebook, Instagram, Music2 } from 'lucide-react';
import LazyImage from '../components/LazyImage';
import { databaseService, TaskRecord, Transaction, User } from '../services/databaseService';

export default function Record() {
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as 'tasks' | 'finance') || 'tasks';
  const initialTab = searchParams.get('tab') || (initialCategory === 'tasks' ? 'doing' : 'all');

  const [activeCategory, setActiveCategory] = useState<'tasks' | 'finance'>(initialCategory);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState<User | null>(null);
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TaskRecord | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTaskLink, setCurrentTaskLink] = useState('');
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const currentUser = databaseService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setTaskRecords(databaseService.getTaskRecords(currentUser.id));
      setTransactions(databaseService.getTransactions(currentUser.id));
    }
  }, []);

  useEffect(() => {
    if (selectedRecord && selectedRecord.status === 'doing') {
      setCurrentTaskLink(databaseService.getRandomTaskLink(selectedRecord.platform));
      setHasVisited(false);
    }
  }, [selectedRecord]);

  const handleLinkClick = () => {
    setHasVisited(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRecord = () => {
    if (!screenshot || !selectedRecord) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Update screenshot first
      databaseService.updateTaskRecord(selectedRecord.id, {
        screenshotUrl: screenshot,
      });

      // Automatically approve and add balance
      databaseService.updateTaskStatus(selectedRecord.id, 'approved');
      
      setIsSubmitting(false);
      setSelectedRecord(null);
      setScreenshot(null);
      setHasVisited(false);
      toast.success('تم إكمال المهمة بنجاح وإضافة الرصيد تلقائياً');
      
      // Refresh task records and user to show updated balance
      const updatedUser = databaseService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
        setTaskRecords(databaseService.getTaskRecords(updatedUser.id));
      }
    }, 1500);
  };

  const taskTabs = [
    { id: 'doing', label: 'المهمة قيد التقدم' },
    { id: 'pending', label: 'تحت المراجعة' },
    { id: 'approved', label: 'كامل' },
    { id: 'rejected', label: 'رفض' },
    { id: 'cancelled', label: 'تم التراجع عنه' },
  ];

  const financeTabs = [
    { id: 'all', label: 'الكل' },
    { id: 'deposit', label: 'الإيداع' },
    { id: 'withdrawal', label: 'السحب' },
    { id: 'subscription', label: 'الاشتراك' },
  ];

  const getFilteredTasks = () => {
    return taskRecords.filter(r => r.status === activeTab);
  };

  const getFilteredTransactions = () => {
    if (activeTab === 'all') return transactions;
    return transactions.filter(t => t.type === activeTab);
  };

  const filteredItems = activeCategory === 'tasks' ? getFilteredTasks() : getFilteredTransactions();

  return (
    <div className="bg-[#f1f4f9] min-h-screen pb-28 font-sans text-right" dir="rtl">
      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedRecord && selectedRecord.status === 'doing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-[360px] rounded-[44px] overflow-hidden shadow-2xl relative font-sans"
            >
              {/* Header with Rounded Bottom */}
              <div className="bg-[#1e74fd] pt-6 pb-12 px-8 relative flex justify-center items-start rounded-b-[45px]">
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="absolute left-8 top-7 text-white/90 hover:text-white transition-colors"
                  title="رجوع"
                >
                  <ChevronLeft size={26} strokeWidth={2.5} />
                </button>
                <h1 className="text-white text-lg font-black tracking-tight">تفاصيل المهمة</h1>
              </div>

              {/* Content area */}
              <div className="px-8 relative pb-8 -mt-8">
                {/* Avatar Box centered and overlapping */}
                <div className="flex justify-center -mt-8 mb-1">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl border-2 border-white/50">
                      <LazyImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'Zea'}`} alt="avatar" className="w-full h-full rounded-full bg-blue-50 object-cover" />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[9px] px-5 py-1 rounded-full font-black shadow-lg border border-white/40 whitespace-nowrap">
                      مصادقة المحمول
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-end mb-2">
                    <div className="inline-block relative">
                      <div className="text-gray-800 font-extrabold text-[14px] px-1 pb-0.5">جانب الطلب</div>
                      <div className="absolute bottom-0 right-0 w-full h-[3px] bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-[24px] border border-gray-50 shadow-sm overflow-hidden mb-4">
                    <div className="flex justify-between items-center py-2.5 px-5 border-b border-gray-50/50">
                       <span className="text-blue-500 font-black text-[11px] uppercase tracking-tighter">{selectedRecord.platform}</span>
                       <span className="text-gray-400 font-bold text-[11px]">عنوان المهمة</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-5 border-b border-gray-50/50">
                       <span className="text-blue-500 font-black text-[11px] tracking-tight">{selectedRecord.reward.toFixed(1)} USDT</span>
                       <span className="text-gray-400 font-bold text-[11px]">دخل</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-5 border-b border-gray-50/50">
                       <span className="text-blue-500 font-black text-[11px]">التعليق مثل</span>
                       <span className="text-gray-400 font-bold text-[11px]">تفاصيل المهمة</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-5 border-b border-gray-50/50">
                       <span className="text-blue-500 font-black text-[11px]">الاشتراك ومثل</span>
                       <span className="text-gray-400 font-bold text-[11px]">يتطلب</span>
                    </div>

                    <div className="flex justify-between items-center py-3 px-5">
                       <label className="cursor-pointer border-2 border-dashed border-gray-100 rounded-xl w-10 h-10 flex items-center justify-center text-gray-300 hover:border-blue-400 hover:text-blue-400 transition-all relative overflow-hidden group bg-gray-50/30">
                         <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                         {screenshot ? (
                           <div className="absolute inset-0">
                             <LazyImage src={screenshot} alt="preview" className="w-full h-full object-cover" />
                           </div>
                         ) : (
                           <ImageIcon size={20} className="opacity-40" />
                         )}
                       </label>
                       <span className="text-gray-400 font-bold text-[11px]">رفع</span>
                    </div>
                  </div>

                  <div className="bg-[#f0f5ff] p-3 rounded-[18px] text-blue-500 text-[10px] font-bold break-all leading-snug mb-6 text-center border border-blue-50/30 mx-2">
                    {currentTaskLink}
                  </div>

                  {/* Toolbar - 4 Icons spaced evenly as per the image */}
                  <div className="flex items-center justify-between px-6 pb-2">
                    <button 
                      onClick={() => {
                        databaseService.updateTaskRecord(selectedRecord.id, { status: 'cancelled' });
                        setSelectedRecord(null);
                        if (user) setTaskRecords(databaseService.getTaskRecords(user.id));
                      }} 
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-rose-500 transition-colors"
                      title="حذف"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l18 0"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>

                    <a 
                      href={currentTaskLink} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-blue-500 transition-colors"
                      title="رابط المهمة"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentTaskLink);
                        toast.success('تم نسخ الرابط');
                      }} 
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-blue-500 transition-colors"
                      title="نسخ الرابط"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>

                    <button 
                      onClick={handleSubmitRecord} 
                      disabled={isSubmitting || !screenshot}
                      className={`w-10 h-10 flex items-center justify-center transition-all ${!screenshot ? 'text-gray-200' : 'text-blue-500 scale-110 active:scale-95'}`}
                      title="إرسال المهمة"
                    >
                      <CheckCircle2 size={28} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {selectedRecord && selectedRecord.status !== 'doing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <div className="bg-blue-600 p-8 text-white relative">
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="absolute top-6 left-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md"
                >
                  <ChevronLeft size={20} className="rotate-180" />
                </button>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-[22px] flex items-center justify-center mb-4 backdrop-blur-md">
                     <ClipboardList size={32} />
                  </div>
                  <h3 className="text-xl font-black">تفاصيل المهمة</h3>
                  <p className="text-[10px] opacity-70 mt-1 font-bold">معلومات المهمة المقدمة للمراجعة</p>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-400 font-bold text-[11px]">معرف المهمة:</span>
                    <span className="text-gray-800 font-black text-xs tracking-widest">{selectedRecord.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-400 font-bold text-[11px]">المنصة:</span>
                    <span className="text-gray-800 font-black text-xs uppercase">{selectedRecord.platform}</span>
                  </div>
                   <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-400 font-bold text-[11px]">المكافأة:</span>
                    <span className="text-blue-600 font-black text-sm tracking-tighter">${selectedRecord.reward.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-400 font-bold text-[11px]">الحالة:</span>
                    <span className={`text-[10px] font-black px-4 py-1 rounded-full ${
                      selectedRecord.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      selectedRecord.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      selectedRecord.status === 'doing' ? 'bg-blue-50 text-blue-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {selectedRecord.status === 'approved' ? 'كامل' : 
                       selectedRecord.status === 'pending' ? 'تحت المراجعة' : 
                       selectedRecord.status === 'doing' ? 'المهمة قيد التقدم' : 
                       selectedRecord.status === 'cancelled' ? 'تم التراجع عنه' : 'رفض'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-400 font-bold text-[11px]">التاريخ:</span>
                    <span className="text-gray-800 font-bold text-xs">{new Date(selectedRecord.createdAt).toLocaleString('ar-EG')}</span>
                  </div>

                  <div className="mt-4">
                    <span className="text-gray-400 font-bold text-[11px] mb-3 block">صورة الإثبات:</span>
                    <div className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-gray-100 shadow-inner">
                      <LazyImage src={selectedRecord.screenshotUrl} className="w-full h-full object-cover bg-transparent" alt="Proof" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-sm mt-8 shadow-xl"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Header */}
      <div className="bg-white px-8 pt-16 pb-6 border-b border-gray-50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] sticky top-0 z-30">
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
              <Link to="/home" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <ChevronLeft size={20} className="rotate-180" />
              </Link>
              <h1 className="text-xl font-black text-gray-800">السجل</h1>
           </div>
           <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <button 
                onClick={() => { setActiveCategory('tasks'); setActiveTab('doing'); }}
                className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeCategory === 'tasks' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}
              >
                المهام
              </button>
              <button 
                onClick={() => { setActiveCategory('finance'); setActiveTab('all'); }}
                className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${activeCategory === 'finance' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}
              >
                المالية
              </button>
           </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {(activeCategory === 'tasks' ? taskTabs : financeTabs).map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3.5 text-[11px] font-black rounded-[20px] transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'bg-gray-50 text-gray-400 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern List View */}
      <div className="p-6 space-y-4">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div 
              key={activeCategory + activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {activeCategory === 'tasks' ? (
                (filteredItems as TaskRecord[]).map((record) => (
                  <motion.div 
                    key={record.id}
                    layout
                    onClick={() => setSelectedRecord(record)}
                    className="bg-white p-5 rounded-[32px] border border-white shadow-sm flex items-center justify-between group active:scale-95 transition-transform"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-blue-50/50 rounded-2xl flex items-center justify-center p-2.5 relative overflow-hidden border border-blue-100/50">
                        {record.platform === 'youtube' && <Youtube className="w-7 h-7 text-red-500" strokeWidth={2.5} />}
                        {record.platform === 'tiktok' && <Music2 className="w-7 h-7 text-gray-900" strokeWidth={2.5} />}
                        {record.platform === 'facebook' && <Facebook className="w-7 h-7 text-blue-600" strokeWidth={2.5} />}
                        {record.platform === 'instagram' && <Instagram className="w-7 h-7 text-pink-600" strokeWidth={2.5} />}
                        {!['youtube', 'tiktok', 'facebook', 'instagram'].includes(record.platform) && (
                          <LazyImage 
                            src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" 
                            className="w-8 h-8 object-contain bg-transparent"
                            alt="platform"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13px] font-black text-gray-800 uppercase tracking-tight">{record.platform}</h4>
                          <div className="h-4 w-[1px] bg-gray-100 mx-1"></div>
                          <span className="text-[10px] font-bold text-gray-400 tracking-wider">#{record.id.slice(5, 9)}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-300">{new Date(record.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-2">
                      <span className="text-sm font-black text-blue-600 tracking-tighter">+${record.reward.toFixed(2)}</span>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                        record.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        record.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        record.status === 'doing' ? 'bg-blue-50 text-blue-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {record.status === 'approved' ? 'كامل' : 
                         record.status === 'pending' ? 'تحت المراجعة' : 
                         record.status === 'doing' ? 'المهمة قيد التقدم' : 
                         record.status === 'cancelled' ? 'تم التراجع عنه' : 'رفض'}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                (filteredItems as Transaction[]).map((tx) => (
                  <motion.div 
                    key={tx.id}
                    layout
                    className="bg-white p-5 rounded-[32px] border border-white shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 
                        tx.type === 'subscription' ? 'bg-blue-50 text-blue-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.type === 'deposit' ? <Plus size={24} /> : 
                         tx.type === 'subscription' ? <Sparkles size={24} /> :
                         <CreditCard size={24} />}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-gray-800">
                          {tx.type === 'deposit' ? 'إيداع رصيد' : 
                           tx.type === 'subscription' ? 'اشتراك VIP' :
                           'سحب أرباح'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-400">{new Date(tx.createdAt).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-2">
                      <div className={`text-sm font-black tracking-tighter ${
                        tx.type === 'deposit' ? 'text-emerald-600' : 
                        tx.type === 'subscription' ? 'text-blue-600' :
                        'text-rose-600'
                      }`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </div>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                        tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        tx.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.status === 'completed' ? 'مكتمل' : tx.status === 'pending' ? 'قيد المراجعة' : 'فاشل'}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center pt-24 px-12 text-center"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-2 border-dashed border-gray-100 rounded-full"
                />
                <div className="w-28 h-28 bg-white rounded-[40px] shadow-2xl shadow-blue-500/5 flex items-center justify-center border border-gray-50 text-gray-100">
                  <ClipboardList className="w-14 h-14" />
                </div>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400 shadow-lg border border-white"
                >
                  <Sparkles size={18} />
                </motion.div>
              </div>
              
              <h2 className="text-xl font-black text-gray-800 mb-2">السجل فارغ تماماً</h2>
              <p className="text-[12px] text-gray-400 font-bold leading-relaxed max-w-[220px]">
                ليس لديك أي سجلات في هذا القسم حالياً.
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/tasks'}
                className="mt-10 px-10 py-4 bg-gray-900 text-white rounded-[24px] text-xs font-black shadow-2xl shadow-gray-900/10"
              >
                استكشاف القاعة
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-64 bg-gradient-to-t from-blue-50/30 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
