import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Youtube, Play, Facebook, Instagram, Search, Filter, Sparkles, Zap, Ticket, CheckCircle2, ExternalLink, Image as ImageIcon, X, Send, Clock } from 'lucide-react';
import ZeaLogo from '../components/ZeaLogo';
import { databaseService, TaskCode, TaskRecord, User } from '../services/databaseService';
import toast from 'react-hot-toast';

export default function Tasks() {
  const [activeTab, setActiveTab ] = useState('youtube');
  const [taskCode, setTaskCode] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [activeTasks, setActiveTasks] = useState<TaskCode | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    setUser(databaseService.getCurrentUser());
  }, []);

  const tabs = [
    { id: 'youtube', label: 'Youtube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-50', url: 'https://youtube.com' },
    { id: 'tiktok', label: 'Tiktok', icon: Play, color: 'text-gray-900', bg: 'bg-gray-100', url: 'https://tiktok.com' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50', url: 'https://facebook.com' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', url: 'https://instagram.com' },
  ];

  const handleValidateCode = () => {
    if (!user) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Custom time window: 14:10 (2:10 PM) to 15:59 (3:59 PM)
    const isValidTime = (hours === 14 && minutes >= 10) || (hours === 15);
    
    if (!isValidTime) {
      setModalState({ isOpen: true, title: 'خارج وقت العمل', message: 'عذراً، نافذة تسليم المهام اليومية مفتوحة فقط من الساعة 2:10 مساءً إلى 4:00 مساءً بتوقيت جهازك.' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    const vipLevels = databaseService.getVipLevels();
    const userVip = vipLevels.find(v => v.level === user.vipLevel);
    
    if (userVip) {
      const userRecords = databaseService.getTaskRecords(user.id).filter(r => r.createdAt.startsWith(today));
      if (userRecords.length >= userVip.tasksPerDay) {
        setModalState({ isOpen: true, title: 'الدخل اليومي مكتمل', message: `لقد اكملت كل مهامك لهذا اليوم. سيتم تصفير الدخل اليومي عند الساعة 12:00 منتصف الليل للبدء مجدداً من الساعة 2:10 ظهراً.` });
        return;
      }
    }

    const codes = databaseService.getDailyCodes(user.id);
    const validCode = codes.find(c => c.code === taskCode && c.date === today);
    
    if (validCode) {
      if (!validCode.isUsed || (validCode.usedAt && (Date.now() - new Date(validCode.usedAt).getTime()) / 3600000 <= 2)) {
        if (!validCode.isUsed) {
          databaseService.useDailyCode(user.id, taskCode);
        }
        
        setIsValidated(true);
        setActiveTasks({ id: 'daily-session', code: taskCode, platform: activeTab, tasksCount: 1, rewardPerTask: 0, createdAt: new Date().toISOString() }); 
        
        // AUTOMATIC TASK CLAIMING FEATURE
        const vipLevels = databaseService.getVipLevels();
        const userVip = vipLevels.find(v => v.level === user.vipLevel);
        
        if (userVip) {
          const userRecords = databaseService.getTaskRecords(user.id).filter(r => r.createdAt.startsWith(today));
          const tasksRemaining = Math.max(0, userVip.tasksPerDay - userRecords.length);
          
          if (tasksRemaining > 0) {
            toast.loading(`جاري تفعيل ${tasksRemaining} مهام...`, { duration: 1500 });
            
            // Claim all remaining tasks
            for (let i = 0; i < tasksRemaining; i++) {
              databaseService.claimTask({
                userId: user.id,
                taskCodeId: 'DAILY',
                platform: activeTab,
                reward: userVip.rewardPerTask,
              });
            }
            
            setTimeout(() => {
              toast.success(`تم تفعيل ${tasksRemaining} مهام بنجاح!`);
            }, 1500);
          }
        }
      } else {
        setModalState({ isOpen: true, title: 'تنبيه', message: 'انتهت صلاحية جلسة العمل الخاصة بك لهذا اليوم (مرت ساعتان).' });
      }
    } else {
      setModalState({ isOpen: true, title: 'خطأ', message: 'كود الدخول غير صالح أو لا يخصك' });
    }
  };

  const handleClaimTask = () => {
    if (!user) {
      setModalState({ isOpen: true, title: 'تنبيه', message: 'يرجى تسجيل الدخول وإدخال الكود أولاً' });
      return;
    }
    
    const vipLevels = databaseService.getVipLevels();
    const userVip = vipLevels.find(v => v.level === user.vipLevel);
    
    if (!userVip) {
      setModalState({ isOpen: true, title: 'تنبيه', message: 'يرجى ترقية حسابك للبدء بتنفيذ المهام.' });
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const userRecords = databaseService.getTaskRecords(user.id).filter(r => r.createdAt.startsWith(today));
    
    if (userRecords.length >= userVip.tasksPerDay) {
      setModalState({ isOpen: true, title: 'تنبيه', message: `لقد وصلت للحد الأقصى لمهامك اليومية (${userVip.tasksPerDay} مهام). يرجى العودة غداً.` });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      databaseService.claimTask({
        userId: user.id,
        taskCodeId: 'DAILY',
        platform: activeTab,
        reward: userVip.rewardPerTask,
      });
      
      setIsSubmitting(false);
      setShowSuccessToast(true);
      
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 2000);
    }, 500);
  };

  return (
    <div className="bg-[#0a0e17] text-white min-h-screen pb-28 font-sans text-right relative overflow-x-hidden" dir="rtl">
      
      {/* Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0e17] to-transparent"></div>
      </div>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-0 right-0 z-[200] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="bg-[#131b2c]/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] border border-emerald-500/20 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-400 shadow-inner">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-white">إضافة بنجاح</h3>
                <p className="text-[10px] font-bold text-gray-400">يمكنك إكمال المهمة من السجل</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#131b2c] px-6 pt-6 pb-6 sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/5 rounded-b-[32px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-wide">قاعة التداول المهام</h1>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }} 
            className="w-10 h-10 bg-[#0a0e17] rounded-xl flex items-center justify-center text-gray-400 hover:text-white border border-white/10 shadow-inner transition-colors"
          >
            <Filter size={18} />
          </motion.button>
        </div>

        {/* Tabs Slider */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button 
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsValidated(false);
                  setActiveTasks(null);
                }}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl whitespace-nowrap transition-all border ${
                  isActive 
                    ? `bg-[#1a2333] border-blue-500/30 shadow-[0_5px_15px_rgba(59,130,246,0.15)]` 
                    : 'bg-[#0a0e17] border-white/5 text-gray-500 hover:bg-[#131b2c]'
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center ${isActive ? tab.color : 'text-gray-500'}`}>
                   <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{tab.label}</span>
                {isActive && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.8)]" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-6 relative z-10">
        {/* Code Entry Section */}
        {!isValidated ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#131b2c] p-8 rounded-[32px] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Ticket size={120} className="rotate-12 text-blue-500" />
            </div>

            <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-500/20">
               <Ticket size={40} className="transform rotate-[-15deg]" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 tracking-wide">أدخل كود الجلسة</h3>
            <p className="text-[11px] text-gray-400 font-bold mb-8 max-w-[240px] mx-auto leading-relaxed">يرجى إدخال الكود المستلم من القناة الرسمية لتفعيل المهام الاستثمارية.</p>
            
            <div className="space-y-5 max-w-sm mx-auto">
              <div className="relative">
                <input 
                  type="text" 
                  value={taskCode}
                  onChange={(e) => setTaskCode(e.target.value)}
                  placeholder="EX: ZEA-CODE"
                  className="w-full py-5 px-6 bg-[#0a0e17] border border-white/10 rounded-2xl text-center font-mono font-bold text-blue-400 text-lg tracking-widest focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all placeholder-gray-700 uppercase"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleValidateCode}
                className="w-full py-5 bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all"
              >
                تفعيل الجلسة
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-5 mb-8 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#0a0e17] rounded-xl flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-500/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
               <h4 className="text-[13px] font-black text-emerald-400 font-mono tracking-widest">{activeTasks?.code} <span className="text-white text-xs mr-2 font-sans bg-emerald-500/20 px-2 py-0.5 rounded">نشط</span></h4>
               <p className="text-[10px] text-gray-400 font-bold mt-1">يمكنك البدء بتنفيذ {activeTasks?.tasksCount} مهام مكافئة.</p>
            </div>
          </motion.div>
        )}

        {/* Task List */}
        <div className="space-y-4">
           <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-[#131b2c] rounded-3xl border border-white/5 overflow-hidden relative group active:scale-95 transition-all outline-none ${!isValidated ? 'opacity-50 grayscale pointer-events-none' : 'hover:border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`}
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#0a0e17] rounded-xl flex items-center justify-center shrink-0 border border-white/5 relative overflow-hidden group-hover:scale-110 transition-transform">
                           {activeTab === 'youtube' && <Youtube className="w-7 h-7 text-red-500" />}
                           {activeTab === 'tiktok' && <div className="w-7 h-7 flex items-center justify-center"><Play className="text-gray-200 fill-gray-200" size={20} /></div>}
                           {activeTab === 'facebook' && <Facebook className="w-7 h-7 text-blue-500" />}
                           {activeTab === 'instagram' && <Instagram className="w-7 h-7 text-pink-500" />}
                        </div>

                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 bg-[#1a2333] text-gray-300 border border-white/5 shadow-inner">
                                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'youtube' ? 'bg-red-500' : activeTab === 'tiktok' ? 'bg-white' : activeTab === 'facebook' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                                {activeTab}
                             </span>
                           </div>
                           <h3 className="font-bold text-gray-200 text-[12px] leading-tight mb-2">زيادة تفاعل حقيقي (مهمة)</h3>
                           <div className="flex items-center gap-1">
                              <span className="text-[12px] font-black text-emerald-400 font-mono tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                +${user ? (databaseService.getVipLevels().find(v => v.level === user.vipLevel)?.rewardPerTask || 0).toFixed(2) : '0.00'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClaimTask}
                      disabled={isSubmitting}
                      className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-5 py-2.5 rounded-xl text-[11px] font-bold active:translate-y-1 transition-all disabled:opacity-50"
                     >
                       استلام
                     </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#131b2c] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 w-full max-w-sm text-center"
          >
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <Filter size={32} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">{modalState.title}</h3>
            <p className="text-[13px] font-bold text-gray-400 mb-8 leading-relaxed max-w-[250px] mx-auto">{modalState.message}</p>
            <button 
              onClick={() => setModalState({ ...modalState, isOpen: false })}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all"
            >
              موافق
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
