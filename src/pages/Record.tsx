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
    <div className="bg-[#0a0e17] text-white min-h-screen pb-28 font-sans text-right relative overflow-x-hidden" dir="rtl">
      
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0e17] to-transparent"></div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedRecord && selectedRecord.status === 'doing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#131b2c] border border-white/10 w-full max-w-[360px] rounded-[44px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative font-sans"
            >
              {/* Header with Rounded Bottom */}
              <div className="bg-gradient-to-br from-[#1a2333] to-[#0a0e17] pt-6 pb-12 px-8 relative flex justify-center items-start rounded-b-[45px] shadow-inner mb-2">
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="absolute left-8 top-7 text-gray-400 hover:text-white transition-colors"
                  title="رجوع"
                >
                  <ChevronLeft size={26} strokeWidth={2.5} />
                </button>
                <h1 className="text-white text-lg font-black tracking-widest textShadow-sm">تفاصيل المهمة</h1>
              </div>

              {/* Content area */}
              <div className="px-8 relative pb-8 -mt-8">
                {/* Avatar Box centered and overlapping */}
                <div className="flex justify-center -mt-8 mb-1">
                  <div className="relative">
                    <div className="w-20 h-20 bg-[#1a2333] rounded-full p-1.5 shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-white/5">
                      <LazyImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'Zea'}`} alt="avatar" className="w-full h-full rounded-full bg-[#131b2c] object-cover mix-blend-lighten" />
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[9px] px-5 py-1 rounded-full font-black shadow-lg shadow-blue-500/10 whitespace-nowrap">
                      مصادقة المحمول
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-end mb-2">
                    <div className="inline-block relative">
                      <div className="text-gray-300 font-extrabold text-[14px] px-1 pb-0.5">جانب الطلب</div>
                      <div className="absolute bottom-0 right-0 w-full h-[3px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="bg-[#0a0e17] rounded-[24px] border border-white/5 shadow-inner overflow-hidden mb-4">
                    <div className="flex justify-between items-center py-2.5 px-5 border-b border-white/5">
                       <span className="text-emerald-400 font-black text-[11px] uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">{selectedRecord.platform}</span>
                       <span className="text-gray-500 font-bold text-[11px]">عنوان المهمة</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-5 border-b border-white/5">
                       <span className="text-blue-400 font-black text-[12px] tracking-tight">{selectedRecord.reward.toFixed(1)} USDT</span>
                       <span className="text-gray-500 font-bold text-[11px]">دخل</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-5 border-b border-white/5">
                       <span className="text-gray-300 font-bold text-[11px]">التعليق مثل</span>
                       <span className="text-gray-500 font-bold text-[11px]">تفاصيل المهمة</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 px-5 border-b border-white/5">
                       <span className="text-gray-300 font-bold text-[11px]">الاشتراك ومثل</span>
                       <span className="text-gray-500 font-bold text-[11px]">يتطلب</span>
                    </div>

                    <div className="flex justify-between items-center py-4 px-5">
                       <label className="cursor-pointer border border-dashed border-white/20 rounded-xl w-14 h-14 flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-all relative overflow-hidden group bg-white/5">
                         <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                         {screenshot ? (
                           <div className="absolute inset-0">
                             <LazyImage src={screenshot} alt="preview" className="w-full h-full object-cover" />
                           </div>
                         ) : (
                           <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                         )}
                       </label>
                       <span className="text-gray-500 font-bold text-[11px]">رفع إثبات</span>
                    </div>
                  </div>

                  <div className="bg-[#1a2333] p-3 rounded-xl text-blue-400 text-[10px] font-mono break-all leading-relaxed mb-6 text-center border border-white/5 mx-2 shadow-inner">
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
                      className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all shadow-sm"
                      title="حذف"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l18 0"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>

                    <a 
                      href={currentTaskLink} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}
                      className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all shadow-sm"
                      title="رابط المهمة"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(currentTaskLink);
                        toast.success('تم نسخ الرابط');
                      }} 
                      className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all shadow-sm"
                      title="نسخ الرابط"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>

                    <button 
                      onClick={handleSubmitRecord} 
                      disabled={isSubmitting || !screenshot}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${!screenshot ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 border border-emerald-400/50'}`}
                      title="إرسال المهمة"
                    >
                      <CheckCircle2 size={24} strokeWidth={2.5} />
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#131b2c] w-full max-w-sm rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 relative"
            >
              <div className="bg-[#1a2333] p-8 text-white relative border-b border-white/5 shadow-inner">
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="absolute top-6 left-6 w-10 h-10 bg-[#0a0e17] rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                     <ClipboardList size={32} />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-wide">تفاصيل السجل</h3>
                  <p className="text-[10px] text-gray-500 mt-1 font-bold">معلومات المهمة المؤرشفة</p>
                </div>
              </div>

              <div className="p-8 pb-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-gray-500 font-bold text-[11px]">معرف المهمة:</span>
                    <span className="text-gray-300 font-mono text-xs tracking-widest">{selectedRecord.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-gray-500 font-bold text-[11px]">المنصة:</span>
                    <span className="text-emerald-400 font-black text-xs uppercase bg-emerald-500/10 px-2 py-0.5 rounded">{selectedRecord.platform}</span>
                  </div>
                   <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-gray-500 font-bold text-[11px]">المكافأة:</span>
                    <span className="text-blue-400 font-black text-sm tracking-widest font-mono">${selectedRecord.reward.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-gray-500 font-bold text-[11px]">الحالة:</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                      selectedRecord.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedRecord.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      selectedRecord.status === 'doing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {selectedRecord.status === 'approved' ? 'كامل' : 
                       selectedRecord.status === 'pending' ? 'تحت المراجعة' : 
                       selectedRecord.status === 'doing' ? 'المهمة قيد التقدم' : 
                       selectedRecord.status === 'cancelled' ? 'تم التراجع عنه' : 'رفض'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-gray-500 font-bold text-[11px]">التاريخ:</span>
                    <span className="text-gray-300 font-mono text-xs opacity-80">{new Date(selectedRecord.createdAt).toLocaleString('ar-EG')}</span>
                  </div>

                  <div className="mt-6">
                    <span className="text-gray-500 font-bold text-[11px] mb-3 block">صورة الإثبات:</span>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#0a0e17]">
                      <LazyImage src={selectedRecord.screenshotUrl} className="w-full h-full object-cover mix-blend-lighten opacity-80" alt="Proof" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-[20px] font-bold text-sm mt-8 shadow-sm transition-all border border-white/5"
                >
                  إغلاق السجل
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Header */}
      <div className="bg-[#131b2c] px-6 pt-6 pb-4 border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] sticky top-0 z-30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex justify-between items-center mb-6 relative z-10">
           <div className="flex items-center gap-3">
              <Link to="/home" className="w-10 h-10 bg-[#0a0e17] rounded-xl flex items-center justify-center text-gray-400 hover:text-white border border-white/5 shadow-inner transition-colors">
                <ChevronLeft size={20} />
              </Link>
              <h1 className="text-xl font-black text-white tracking-widest textShadow-sm">سجلات الأنشطة</h1>
           </div>
           <div className="flex bg-[#0a0e17] p-1 rounded-2xl border border-white/5 shadow-inner">
              <button 
                onClick={() => { setActiveCategory('tasks'); setActiveTab('doing'); }}
                className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all ${activeCategory === 'tasks' ? 'bg-[#1a2333] text-white border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                المهام
              </button>
              <button 
                onClick={() => { setActiveCategory('finance'); setActiveTab('all'); }}
                className={`px-4 py-2 text-[10px] font-bold rounded-xl transition-all ${activeCategory === 'finance' ? 'bg-[#1a2333] text-white border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                المالية
              </button>
           </div>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 relative z-10">
          {(activeCategory === 'tasks' ? taskTabs : financeTabs).map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap border ${
                activeTab === tab.id 
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                  : 'bg-transparent text-gray-500 border-white/5 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern List View */}
      <div className="p-6 space-y-4 relative z-10">
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
                    className="bg-[#131b2c] p-4 rounded-[24px] border border-white/5 shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0a0e17] rounded-xl flex items-center justify-center p-2.5 relative overflow-hidden border border-white/5 shadow-inner">
                        {record.platform === 'youtube' && <Youtube className="w-6 h-6 text-red-500" strokeWidth={2} />}
                        {record.platform === 'tiktok' && <Music2 className="w-6 h-6 text-blue-400" strokeWidth={2} />}
                        {record.platform === 'facebook' && <Facebook className="w-6 h-6 text-blue-600" strokeWidth={2} />}
                        {record.platform === 'instagram' && <Instagram className="w-6 h-6 text-pink-500" strokeWidth={2} />}
                        {!['youtube', 'tiktok', 'facebook', 'instagram'].includes(record.platform) && (
                          <div className="w-6 h-6 opacity-50 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[12px] font-bold text-gray-200 uppercase tracking-widest">{record.platform}</h4>
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                            <span className="text-[9px] font-mono text-gray-500">#{record.id.slice(5, 9)}</span>
                          </div>
                        </div>
                        <p className="text-[9px] font-mono opacity-50 text-gray-400">{new Date(record.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-2">
                       <span className="text-[13px] font-black font-mono text-emerald-400 tracking-wider">+{record.reward.toFixed(2)}$</span>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md border ${
                        record.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        record.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        record.status === 'doing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {record.status === 'approved' ? 'مكتمل' : 
                         record.status === 'pending' ? 'قيد المراجعة' : 
                         record.status === 'doing' ? 'التقدم' : 
                         record.status === 'cancelled' ? 'تراجع' : 'مرفوض'}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                (filteredItems as Transaction[]).map((tx) => (
                  <motion.div 
                    key={tx.id}
                    layout
                    className="bg-[#131b2c] p-4 rounded-[24px] border border-white/5 shadow-[0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${
                        tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        tx.type === 'subscription' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {tx.type === 'deposit' ? <Plus size={20} /> : 
                         tx.type === 'subscription' ? <Sparkles size={20} /> :
                         <CreditCard size={20} />}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h4 className="text-[12px] font-bold text-gray-200">
                          {tx.type === 'deposit' ? 'إيداع رصيد' : 
                           tx.type === 'subscription' ? 'اشتراك VIP' :
                           'سحب أرباح'}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-gray-500">{new Date(tx.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-2">
                      <div className={`text-[13px] font-black font-mono tracking-wider ${
                        tx.type === 'deposit' ? 'text-emerald-400' : 
                        tx.type === 'subscription' ? 'text-blue-400' :
                        'text-rose-400'
                      }`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </div>
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-md border ${
                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
                  className="absolute -inset-4 border border-dashed border-white/10 rounded-full"
                />
                <div className="w-24 h-24 bg-[#131b2c] rounded-[32px] shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/5 text-gray-600">
                  <ClipboardList className="w-10 h-10" />
                </div>
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-[#0a0e17] rounded-xl flex items-center justify-center text-gray-500 shadow-inner border border-white/5"
                >
                  <Sparkles size={14} />
                </motion.div>
              </div>
              
              <h2 className="text-lg font-black text-white mb-2 tracking-wide">القسم فارغ تماماً</h2>
              <p className="text-[11px] text-gray-500 font-bold leading-relaxed max-w-[220px]">
                ليس لديك أي سجلات مسجلة في هذه الفئة حتى الآن.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
