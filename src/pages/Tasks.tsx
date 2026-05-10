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
    const codes = databaseService.getDailyCodes(user.id);
    const today = new Date().toISOString().split('T')[0];
    
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
    <div className="bg-[#fcfdfe] min-h-screen pb-28 font-sans text-right" dir="rtl">
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-0 right-0 z-[200] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl shadow-blue-500/10 border border-emerald-50 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <CheckCircle2 size={18} />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-black text-gray-800">إضافة بنجاح</h3>
                <p className="text-[10px] font-bold text-gray-400">يمكنك إكمال المهمة من السجل</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white px-8 pt-16 pb-8 sticky top-0 z-30 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border-b border-gray-100/50 rounded-b-[40px]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">قاعة المهام</h1>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }} 
            className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100"
          >
            <Filter size={20} />
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
                className={`flex items-center gap-3 px-8 py-4 rounded-[24px] whitespace-nowrap transition-all border ${
                  isActive 
                    ? `bg-white border-blue-100 shadow-[0_15px_30px_rgba(37,99,235,0.1)]` 
                    : 'bg-gray-50/50 border-transparent text-gray-400'
                }`}
              >
                <div className={`w-6 h-6 flex items-center justify-center ${isActive ? tab.color : 'text-gray-300'}`}>
                   <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={`text-xs font-black ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{tab.label}</span>
                {isActive && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Code Entry Section */}
        {!isValidated ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-[44px] border border-gray-100/50 shadow-2xl shadow-blue-500/5 mb-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Ticket size={120} className="rotate-12" />
            </div>

            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner">
               <Ticket size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">أدخل كود اليوم</h3>
            <p className="text-[12px] text-gray-400 font-bold mb-10 max-w-[240px] mx-auto leading-relaxed">يرجى إدخال الكود المستلم من قناة التليجرام الرسمية لتفعيل المهام.</p>
            
            <div className="space-y-6 max-w-sm mx-auto">
              <div className="relative">
                <input 
                  type="text" 
                  value={taskCode}
                  onChange={(e) => setTaskCode(e.target.value)}
                  placeholder="Ex: ZEA-2024-X"
                  className="w-full py-6 px-8 bg-gray-50 border border-gray-100/50 rounded-[28px] text-center font-black text-blue-600 text-lg tracking-widest focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleValidateCode}
                className="w-full py-6 bg-blue-600 text-white rounded-[28px] font-black text-sm shadow-2xl shadow-blue-600/30 active:translate-y-1 transition-all"
              >
                تفعيل المهام الآن
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-6 mb-10 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <div>
               <h4 className="text-[13px] font-black text-emerald-900">الكود نشط: {activeTasks?.code}</h4>
               <p className="text-[10px] text-emerald-700/70 font-bold">يمكنك البدء بتنفيذ {activeTasks?.tasksCount} مهام مكافئة.</p>
            </div>
          </motion.div>
        )}

        {/* Task List */}
        <div className="space-y-5">
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
                  className={`bg-white rounded-[32px] border border-gray-50 overflow-hidden relative group active:scale-95 transition-all outline-none ${!isValidated ? 'opacity-40 grayscale pointer-events-none' : 'shadow-sm hover:shadow-md'}`}
                >
                  <div className="p-4 flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-[22px] flex items-center justify-center shrink-0 border border-gray-100 relative overflow-hidden group-hover:scale-110 transition-transform">
                           {activeTab === 'youtube' && <Youtube className="w-8 h-8 text-red-500" />}
                           {activeTab === 'tiktok' && <div className="w-8 h-8 flex items-center justify-center"><Play className="text-gray-900 fill-gray-900" size={22} /></div>}
                           {activeTab === 'facebook' && <Facebook className="w-8 h-8 text-blue-600" />}
                           {activeTab === 'instagram' && <Instagram className="w-8 h-8 text-pink-600" />}
                        </div>

                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-600/90 text-white shadow-sm">
                               {activeTab}
                             </span>
                           </div>
                           <h3 className="font-black text-gray-800 text-[13px] leading-tight mb-1">زيادة تفاعل حقيقي</h3>
                           <div className="flex items-center gap-1">
                              <span className="text-[12px] font-black text-blue-600 tracking-tighter">
                                ${user ? (databaseService.getVipLevels().find(v => v.level === user.vipLevel)?.rewardPerTask || 0).toFixed(2) : '0.00'}+
                              </span>
                           </div>
                        </div>
                     </div>

                     <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClaimTask}
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-[16px] text-[11px] font-black shadow-lg shadow-blue-600/20 active:translate-y-1 transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] shadow-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-xl font-black text-gray-800 mb-2">{modalState.title}</h3>
            <p className="text-sm font-bold text-gray-500 mb-6 leading-relaxed">{modalState.message}</p>
            <button 
              onClick={() => setModalState({ ...modalState, isOpen: false })}
              className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              حسناً
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
