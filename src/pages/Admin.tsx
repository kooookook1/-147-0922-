import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  ShieldCheck, 
  AlertCircle,
  ArrowUpRight,
  UserPlus,
  Layout,
  Activity,
  History,
  ShieldAlert,
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Bell,
  Ban,
  Gift,
  Mail,
  Camera,
  MessageSquare,
  Send,
  Eye,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ZeaLogo from '../components/ZeaLogo';
import LazyImage from '../components/LazyImage';
import { databaseService, Currency, TaskCode, Transaction, User, TaskRecord, ChatMessage, VipLevel, UserDailyCode } from '../services/databaseService';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab ] = useState('dashboard');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [taskCodes, setTaskCodes] = useState<TaskCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [dailyCodes, setDailyCodes] = useState<UserDailyCode[]>([]);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [commission, setCommission] = useState(19);
  const [isMaintenance, setIsMaintenance] = useState(false);
  
  // Chat States
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // Currency Modal State
  const [currencyModal, setCurrencyModal] = useState<{
    isOpen: boolean;
    currency: Partial<Currency> | null;
  }>({ isOpen: false, currency: null });

  // Custom Prompt Modal State
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'number' | 'text' | 'confirm' | 'double_number';
    value: string;
    value2?: string;
    label1?: string;
    label2?: string;
    onConfirm: (val: string, val2?: string) => void;
  }>({ isOpen: false, title: '', description: '', type: 'text', value: '', onConfirm: () => {} });

  // UI States
  const [searchId, setSearchId] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [financeTypeFilter, setFinanceTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [financeDateStart, setFinanceDateStart] = useState('');
  const [financeDateEnd, setFinanceDateEnd] = useState('');

  const refreshData = () => {
    setCurrencies(databaseService.getCurrencies());
    setTaskCodes(databaseService.getTaskCodes());
    setTransactions(databaseService.getTransactions());
    setUsers(databaseService.getUsers());
    setTaskRecords(databaseService.getTaskRecords());
    setVipLevels(databaseService.getVipLevels());
    setDailyCodes(databaseService.getDailyCodes());
    setMaintenanceMsg(databaseService.getMaintenanceMessage());
    if (selectedChatUser) {
      setChatMessages(databaseService.getChatMessages(selectedChatUser.id));
    }
  };

  useEffect(() => {
    const user = databaseService.getCurrentUser();
    if (!user || user.email !== 'admin@zea.com') {
      navigate('/home');
      return;
    }
    refreshData();
    // Load commission once on mount
    setCommission(databaseService.getWithdrawalCommission());
    
    const interval = setInterval(refreshData, 5000); 
    return () => clearInterval(interval);
  }, [selectedChatUser, navigate]);

  const stats = [
    { label: 'إجمالي المستخدمين', value: users.length.toString(), change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'مهام قيد الانتظار', value: taskRecords.filter(r => r.status === 'pending').length.toString(), change: 'تتطلب مراجعة', icon: Camera, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'إجمالي السحوبات', value: transactions.filter(t => t.type === 'withdrawal').length.toString(), change: 'طلب سحب', icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'نشاط الوكلاء', value: transactions.length.toString(), change: '+5%', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleUpdateMaintenance = () => {
    databaseService.setMaintenanceMessage(maintenanceMsg);
    databaseService.setWithdrawalCommission(commission);
    toast.success('تم تحديث إعدادات النظام بنجاح');
  };

  const handleApproveTx = (id: string) => {
    databaseService.updateTransactionStatus(id, 'completed');
    refreshData();
  };

  const handleRejectTx = (id: string) => {
    databaseService.updateTransactionStatus(id, 'failed');
    refreshData();
  };

  const handleApproveTask = (id: string) => {
    databaseService.updateTaskStatus(id, 'approved');
    refreshData();
  };

  const handleRejectTask = (id: string) => {
    databaseService.updateTaskStatus(id, 'rejected');
    refreshData();
  };

  const handleBanUser = (user: User) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    databaseService.saveUser({ ...user, status: newStatus });
    refreshData();
  };

  const handleAddBalance = (user: User) => {
    setPromptModal({
      isOpen: true,
      title: 'تعديل رصيد المستخدم',
      description: `أدخل المبلغ لإضافته إلى أو خصمه (بالسالب) من رصيد ${user.name}:`,
      type: 'number',
      value: '',
      onConfirm: (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return;
        databaseService.saveUser({ ...user, balance: user.balance + num });
        databaseService.createTransaction({
          userId: user.id,
          amount: Math.abs(num),
          type: num >= 0 ? 'deposit' : 'withdrawal',
          status: 'completed'
        });
        refreshData();
      }
    });
  };

  const handleAddHonorPoints = (user: User) => {
    setPromptModal({
      isOpen: true,
      title: 'تعديل نقاط الشرف',
      description: `أدخل نقاط الشرف لإضافتها أو خصمها (بالسالب) لـ ${user.name}:`,
      type: 'number',
      value: '',
      onConfirm: (amount) => {
        const num = parseInt(amount);
        if (isNaN(num)) return;
        databaseService.saveUser({ ...user, honorPoints: user.honorPoints + num });
        refreshData();
      }
    });
  };

  const handleSendReply = () => {
    if (!selectedChatUser || !replyText.trim()) return;
    databaseService.sendChatMessage({
      userId: selectedChatUser.id,
      sender: 'admin',
      text: replyText,
    });
    setReplyText('');
    refreshData();
  };

  const handleDeleteMessage = (msgId: string) => {
    setPromptModal({
      isOpen: true,
      title: 'حذف الرسالة',
      description: 'هل أنت متأكد من حذف هذه الرسالة بشكل نهائي؟',
      type: 'confirm',
      value: '',
      onConfirm: () => {
        databaseService.deleteChatMessage(msgId);
        refreshData();
      }
    });
  };

  const handleAddCurrency = () => {
    setCurrencyModal({
      isOpen: true,
      currency: {
        id: `CURR-${Date.now()}`,
        name: '',
        network: '',
        address: '',
        qrUrl: '',
        iconUrl: '',
        price: '1.00',
        isActive: true
      }
    });
  };

  const handleEditCurrency = (curr: Currency) => {
    setCurrencyModal({
      isOpen: true,
      currency: curr
    });
  };

  const handleSaveCurrency = () => {
    if (currencyModal.currency) {
      const c = currencyModal.currency as Currency;
      if (!c.name || !c.address) {
        toast.error('يرجى ملء الحقول المطلوبة');
        return;
      }
      databaseService.saveCurrency(c);
      setCurrencyModal({ isOpen: false, currency: null });
      refreshData();
      toast.success('تم حفظ العملة بنجاح');
    }
  };

  const handleDeleteCurrency = (id: string) => {
    setPromptModal({
      isOpen: true,
      title: 'حذف العملة',
      description: 'هل أنت متأكد من حذف هذه العملة بشكل نهائي؟',
      type: 'confirm',
      value: '',
      onConfirm: () => {
        databaseService.deleteCurrency(id);
        refreshData();
        toast.success('تم حذف العملة');
      }
    });
  };

  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(searchId.toLowerCase()) || 
    (u.phoneNumber && u.phoneNumber.includes(searchId)) ||
    u.name.toLowerCase().includes(searchId.toLowerCase())
  );

  const pendingTasks = taskRecords.filter(r => r.status === 'pending');

  const filteredTransactions = transactions.filter(tx => {
    let matchType = true;
    if (financeTypeFilter !== 'all') {
      matchType = tx.type === financeTypeFilter;
    }
    
    let matchDate = true;
    if (financeDateStart || financeDateEnd) {
      const txDate = new Date(tx.createdAt);
      txDate.setHours(0, 0, 0, 0);
      
      if (financeDateStart) {
        const start = new Date(financeDateStart);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) matchDate = false;
      }
      if (financeDateEnd) {
        const end = new Date(financeDateEnd);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) matchDate = false;
      }
    }
    
    return matchType && matchDate;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans text-right overflow-x-hidden" dir="rtl">
      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={previewImage} 
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              alt="Preview"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 bg-white border-l border-gray-100 flex flex-col sticky top-0 h-auto lg:h-screen z-40 p-6 shadow-xl lg:shadow-none">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center overflow-hidden">
               <ZeaLogo className="scale-50 translate-x-1" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight">لوحة التحكم</h1>
              <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest leading-none mt-0.5">Zea Enterprises</p>
            </div>
          </div>

          <nav className="space-y-1.5 overflow-x-auto lg:overflow-visible flex lg:flex-col pb-4 lg:pb-0 scrollbar-hide">
            {[
              { id: 'dashboard', label: 'الرئيسية', icon: Layout },
              { id: 'users', label: 'المستخدمين', icon: Users },
              { id: 'task-review', label: 'مراجعة المهام', icon: Camera, count: pendingTasks.length },
              { id: 'finance', label: 'المالية', icon: DollarSign },
              { id: 'messaging', label: 'المراسلات', icon: MessageSquare },
              { id: 'currencies', label: 'العملات', icon: Globe },
              { id: 'tasks', label: 'إدارة الأكواد', icon: Activity },
              { id: 'vip-levels', label: 'مستويات VIP', icon: Star },
              { id: 'daily-codes', label: 'الكود اليومي', icon: ShieldCheck },
              { id: 'settings', label: 'إعدادات النظام', icon: Settings },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-[18px] text-[13px] font-black tracking-tight transition-all whitespace-nowrap min-w-max lg:min-w-0 ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' 
                  : 'bg-transparent text-gray-400 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                <span className="flex-1">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden lg:block pt-6 border-t border-gray-50">
             <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-black">AD</div>
                <div className="flex flex-col">
                   <span className="text-xs font-black text-gray-800">مدير النظام</span>
                   <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">متصل الآن</span>
                </div>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-50 sticky top-0 z-30 p-8 hidden lg:block">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-black text-gray-800 tracking-tight">
                 {activeTab === 'dashboard' ? 'مرحباً، إليك ملخص النشاط اليومي' : 
                  activeTab === 'users' ? 'إدارة حسابات الموظفين' : 
                  activeTab === 'task-review' ? 'مراجعة وتنفيذ المهام المقدمة' : 
                  activeTab === 'finance' ? 'العمليات المالية المعلقة' :
                  activeTab === 'messaging' ? 'مركز خدمات المراسلة الفورية' : 'إعدادات المنصة'}
               </h2>
               <div className="flex gap-4">
                  <div className="bg-gray-100/50 p-2 rounded-xl flex gap-2">
                     <button className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600"><Bell size={16} /></button>
                     <button className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600"><Mail size={16} /></button>
                  </div>
               </div>
            </div>
          </header>

          <main className="p-6 lg:p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                           <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 shadow-sm`}>
                              <stat.icon size={22} />
                           </div>
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</h4>
                           <div className="flex items-end justify-between">
                              <span className="text-2xl font-black text-gray-800 tracking-tighter">{stat.value}</span>
                              <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-500 rounded-md">{stat.change}</span>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                           <div className="flex justify-between items-center mb-8">
                              <h3 className="text-lg font-black text-gray-800 tracking-tight">آخر العمليات المالية</h3>
                              <button onClick={() => setActiveTab('finance')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">عرض الكل</button>
                           </div>
                           <div className="space-y-5">
                              {transactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-3xl border border-gray-50">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        tx.type === 'deposit' ? 'bg-blue-100 text-blue-600' : 
                                        tx.type === 'subscription' ? 'bg-purple-100 text-purple-600' :
                                        'bg-rose-100 text-rose-600'}`}>
                                         {tx.type === 'deposit' ? <ArrowUpRight size={20} /> : 
                                          tx.type === 'subscription' ? <Sparkles size={20} /> :
                                          <TrendingUp size={20} className="rotate-180" />}
                                      </div>
                                      <div>
                                         <h5 className="text-[13px] font-black text-gray-800">
                                           {tx.type === 'deposit' ? 'إيداع رصيد' : 
                                            tx.type === 'subscription' ? 'اشتراك VIP' :
                                            'سحب أرباح'}
                                         </h5>
                                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{tx.id} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                                      </div>
                                   </div>
                                   <div className="text-left">
                                      <span className="text-sm font-black text-gray-800">${tx.amount.toFixed(2)}</span>
                                      <p className={`text-[9px] font-black ${tx.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.status === 'completed' ? 'مكتمل' : 'قيد المراجعة'}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                           <h3 className="text-lg font-black text-gray-800 tracking-tight mb-6">سرعة وصول النظام</h3>
                           <div className="space-y-4">
                              <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white">
                                 <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest block mb-2">استهلاك السيرفر</span>
                                 <div className="text-xl font-black mb-4">98.2% <small className="text-[10px] font-bold opacity-60">Optimized</small></div>
                                 <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-[98%] h-full bg-white shadow-[0_0_10px_white]" />
                                 </div>
                              </div>
                              <div className="p-5 bg-gray-50 rounded-[32px] border border-gray-100">
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">المستخدمين النشطين الآن</span>
                                 <div className="text-xl font-black text-gray-800">429 <small className="text-[10px] font-bold text-emerald-500">Live</small></div>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                   <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
                      <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tighter">قائمة الموظفين</h2>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage user hierarchy and access control</p>
                      </div>
                      <div className="relative w-full md:w-96">
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                          type="text" 
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          placeholder="بحث بالاسم، الرقم، أو المعرف..." 
                          className="w-full py-4 pr-12 pl-6 bg-white border border-gray-100 rounded-3xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all focus:outline-none" 
                        />
                      </div>
                   </div>

                   <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse min-w-[800px]">
                          <thead className="bg-gray-50/50">
                              <tr className="border-b border-gray-100">
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الموظف والمعلومات</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الهاتف</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الرصيد المتاح</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الحالة</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">التحكم السريع</th>
                              </tr>
                          </thead>
                          <tbody>
                              {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b last:border-0 border-gray-50 hover:bg-blue-50/10 transition-colors">
                                  <td className="p-6">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-xs text-gray-500 uppercase tracking-tighter">
                                           {user.name.slice(0, 2)}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm font-black text-gray-800">{user.name}</span>
                                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none mt-1">{user.id}</span>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="p-6 text-sm font-bold text-gray-600">{user.phoneNumber || 'غير مسجل'}</td>
                                  <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black text-gray-800 tracking-tighter">${user.balance.toFixed(2)}</span>
                                        <button onClick={() => handleAddBalance(user)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="إضافة/خصم رصيد"><Plus size={14} /></button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-gray-500">{user.honorPoints} نقطة شرف</span>
                                        <button onClick={() => handleAddHonorPoints(user)} className="p-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors" title="تعديل نقاط الشرف"><Star size={10} /></button>
                                    </div>
                                  </td>
                                  <td className="p-6">
                                     <span className={`text-[10px] font-black px-3 py-1 rounded-full ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                       {user.status === 'active' ? '● متاح' : '● محظور'}
                                     </span>
                                  </td>
                                  <td className="p-6">
                                     <div className="flex gap-2">
                                        <button onClick={() => handleBanUser(user)} className={`p-2.5 rounded-xl transition-all shadow-sm ${user.status === 'active' ? 'bg-rose-50/50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50/50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}>
                                           {user.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                        <button onClick={() => { setActiveTab('messaging'); setSelectedChatUser(user); }} className="p-2.5 bg-blue-50/50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"><MessageSquare size={16} /></button>
                                        <button className="p-2.5 bg-gray-50/50 text-gray-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                                     </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'task-review' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                   <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tighter">مراجعة المهام</h2>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Verify task proofs and gift rewards</p>
                      </div>
                      <div className="bg-amber-50 px-6 py-2 rounded-2xl border border-amber-100">
                         <span className="text-[10px] font-black text-amber-600">مهام بانتظار المراجعة: {pendingTasks.length}</span>
                      </div>
                   </div>

                   {pendingTasks.length === 0 ? (
                     <div className="bg-white rounded-[40px] border border-gray-100 p-20 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 border border-gray-100">
                           <CheckCircle size={40} />
                        </div>
                        <h3 className="text-lg font-black text-gray-800">كل شيء تمام!</h3>
                        <p className="text-sm text-gray-400 font-bold max-w-xs mt-2">لا توجد مهام معلقة لمراجعتها حالياً. جميع الطلبات تم معالجتها.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingTasks.map((record) => (
                          <motion.div 
                            key={record.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm flex flex-col group"
                          >
                             <div className="relative aspect-video bg-gray-100 group-hover:brightness-90 transition-all cursor-zoom-in overflow-hidden" onClick={() => setPreviewImage(record.screenshotUrl)}>
                                <LazyImage src={record.screenshotUrl} alt="Proof" className="w-full h-full object-cover bg-transparent" />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full animate-pulse ${record.platform === 'youtube' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">{record.platform}</span>
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                   <Eye className="text-white" size={32} />
                                </div>
                             </div>
                             <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                   <div>
                                      <h4 className="text-sm font-black text-gray-800 mb-1">الموظف: {record.userId}</h4>
                                      <p className="text-[10px] font-bold text-gray-400">{new Date(record.createdAt).toLocaleString('ar-EG')}</p>
                                   </div>
                                   <div className="text-left font-black text-blue-600 text-lg tracking-tighter">${record.reward.toFixed(2)}</div>
                                </div>

                                <div className="flex gap-3">
                                   <button 
                                      onClick={() => handleApproveTask(record.id)}
                                      className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                   >
                                      <Check size={18} /> قبول وصرف
                                   </button>
                                   <button 
                                      onClick={() => handleRejectTask(record.id)}
                                      className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                   >
                                      <X size={18} /> رفض الطلب
                                   </button>
                                </div>
                             </div>
                          </motion.div>
                        ))}
                     </div>
                   )}
                </motion.div>
              )}

              {activeTab === 'messaging' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-[calc(100vh-180px)] flex gap-8">
                   {/* User List for Chat */}
                   <div className="w-80 bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                      <div className="p-6 border-b border-gray-50">
                         <h3 className="font-black text-gray-800 mb-4">المحادثات</h3>
                         <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                            <input 
                              type="text" 
                              placeholder="الباحث عن مستخدم..." 
                              className="w-full py-2.5 pr-10 pl-4 bg-gray-50 border border-gray-50 rounded-xl text-xs font-bold focus:outline-none" 
                            />
                         </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                         {users.map(u => (
                           <button 
                            key={u.id}
                            onClick={() => setSelectedChatUser(u)}
                            className={`w-full p-4 rounded-[24px] flex items-center gap-4 transition-all ${selectedChatUser?.id === u.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'hover:bg-gray-50 text-gray-800'}`}
                           >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${selectedChatUser?.id === u.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                                 {u.name.slice(0, 2)}
                              </div>
                              <div className="text-right overflow-hidden">
                                 <h5 className="text-[13px] font-black truncate">{u.name}</h5>
                                 <span className={`text-[9px] font-bold opacity-60 uppercase tracking-widest ${selectedChatUser?.id === u.id ? 'text-white' : 'text-blue-500'}`}>{u.id}</span>
                              </div>
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Chat Window */}
                   <div className="flex-1 bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
                      {selectedChatUser ? (
                        <>
                          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                   {selectedChatUser.name.slice(0, 2)}
                                </div>
                                <div>
                                   <h3 className="font-black text-gray-800">{selectedChatUser.name}</h3>
                                   <p className="text-[10px] font-bold text-gray-400">رقم الهاتف: {selectedChatUser.phoneNumber || 'غير متوفر'}</p>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:text-gray-600"><AlertCircle size={18} /></button>
                                <button className="p-2.5 bg-white border border-gray-100 text-rose-500 rounded-xl hover:bg-rose-50"><Ban size={18} /></button>
                             </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col">
                             {chatMessages.length === 0 ? (
                               <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                                  <MessageSquare size={48} className="mb-4" />
                                  <p className="text-sm font-black">لا توجد رسائل سابقة</p>
                               </div>
                             ) : (
                               chatMessages.map((msg, idx) => (
                                 <div key={idx} className={`max-w-[70%] p-5 rounded-[28px] text-[13px] font-bold leading-relaxed shadow-sm relative group ${msg.sender === 'admin' ? 'bg-blue-600 text-white self-start rounded-tr-none' : 'bg-gray-100 text-gray-800 self-end rounded-tl-none'}`}>
                                    {msg.text}
                                    <div className={`text-[8px] font-bold mt-2 opacity-60 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                                       {new Date(msg.createdAt).toLocaleTimeString('ar-EG')}
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 bg-rose-500 text-white rounded-full transition-opacity"
                                      title="حذف الرسالة"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                 </div>
                               ))
                             )}
                          </div>

                          <div className="p-6 border-t border-gray-50 bg-gray-50/5">
                             <div className="relative flex gap-4">
                                <input 
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                                  placeholder="اكتب ردك هنا للموظف..." 
                                  className="flex-1 py-4 pr-6 pl-14 bg-white border border-gray-100 rounded-[24px] text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all focus:outline-none" 
                                />
                                <button 
                                  onClick={handleSendReply}
                                  className="px-8 bg-blue-600 text-white rounded-[24px] font-black text-xs shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                   إرسال الرد <Send size={14} />
                                </button>
                             </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                           <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-200 mb-8">
                              <MessageSquare size={48} />
                           </div>
                           <h3 className="text-lg font-black text-gray-800">مركز الرد المباشر</h3>
                           <p className="text-sm text-gray-400 font-bold max-w-sm mt-2 leading-relaxed">يرجى اختيار موظف من القائمة الجانبية لبدء المحادثة أو الرد على استفساراته وحل مشاكل الحساب.</p>
                        </div>
                      )}
                   </div>
                </motion.div>
              )}

              {activeTab === 'finance' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                   <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                     <h2 className="text-2xl font-black text-gray-800 tracking-tighter">العمليات المالية المعالجة</h2>
                     
                     <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                       <select 
                          value={financeTypeFilter}
                          onChange={(e) => setFinanceTypeFilter(e.target.value as any)}
                          className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="all">جميع العمليات</option>
                          <option value="deposit">إيداع رصيد</option>
                          <option value="withdrawal">طلب سحب</option>
                        </select>
                        <div className="flex gap-2 items-center">
                         <span className="text-xs font-bold text-gray-400">من:</span>
                         <input 
                           type="date" 
                           value={financeDateStart}
                           onChange={(e) => setFinanceDateStart(e.target.value)}
                           className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                         />
                         <span className="text-xs font-bold text-gray-400">إلى:</span>
                         <input 
                           type="date" 
                           value={financeDateEnd}
                           onChange={(e) => setFinanceDateEnd(e.target.value)}
                           className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                         />
                        </div>
                     </div>
                   </div>
                   <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right min-w-[800px]">
                          <thead className="bg-gray-50/50">
                              <tr className="border-b border-gray-100">
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">نوع العملية</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">المبلغ</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">العنوان والشبكة</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الموظف</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الحالة</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">التاريخ</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الإجراء</th>
                              </tr>
                          </thead>
                          <tbody>
                              {filteredTransactions.map(tx => (
                                <tr key={tx.id} className="border-b last:border-0 border-gray-50">
                                  <td className="p-6">
                                     <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${
                                       tx.type === 'deposit' ? 'bg-blue-50 text-blue-600' : 
                                       tx.type === 'subscription' ? 'bg-purple-50 text-purple-600' :
                                       'bg-amber-50 text-amber-600'}`}>
                                       {tx.type === 'deposit' ? 'إيداع رصيد' : 
                                        tx.type === 'subscription' ? 'اشتراك VIP' : 
                                        'سحب أرباح'}
                                     </span>
                                  </td>
                                  <td className="p-6">
                                     <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-800">${tx.amount.toFixed(2)}</span>
                                        {tx.type === 'withdrawal' && tx.fee && (
                                          <span className="text-[9px] font-bold text-rose-500">-${tx.fee.toFixed(2)} عمولة</span>
                                        )}
                                     </div>
                                  </td>
                                  <td className="p-6">
                                     {tx.type === 'withdrawal' && (
                                       <div className="flex flex-col gap-1 items-start">
                                         <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded leading-none">{tx.walletNetwork || 'TRC20'}</span>
                                         <button 
                                           onClick={() => {
                                             navigator.clipboard.writeText(tx.networkAddress || '');
                                             toast.success('تم نسخ العنوان');
                                           }}
                                           className="text-[9px] font-bold text-gray-400 hover:text-gray-600 truncate max-w-[150px] transition-colors"
                                           title={tx.networkAddress}
                                         >
                                           {tx.networkAddress || 'لا يوجد عنوان'}
                                         </button>
                                       </div>
                                     )}
                                  </td>
                                  <td className="p-6 text-[11px] font-black text-blue-500 uppercase tracking-widest">{tx.userId}</td>
                                  <td className="p-6">
                                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                       tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 
                                       tx.status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-gray-400'
                                     }`}>
                                       {tx.status === 'completed' ? 'ناجحة' : tx.status === 'pending' ? 'بانتظار المراجعة' : 'مرفوضة'}
                                     </span>
                                  </td>
                                  <td className="p-6 text-[10px] font-bold text-gray-400">{new Date(tx.createdAt).toLocaleString('ar-EG')}</td>
                                  <td className="p-6">
                                     {tx.status === 'pending' && (
                                       <div className="flex gap-2">
                                         <button onClick={() => handleApproveTx(tx.id)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><CheckCircle size={16} /></button>
                                         <button onClick={() => handleRejectTx(tx.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><XCircle size={16} /></button>
                                       </div>
                                     )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'currencies' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-gray-800 tracking-tighter">بوابات الدفع والعملات</h2>
                      <button 
                        onClick={handleAddCurrency}
                        className="bg-blue-600 text-white px-8 py-3.5 rounded-[22px] font-black text-xs flex items-center gap-2 shadow-xl shadow-blue-600/20"
                      >
                        <Plus size={18} /> إضافة بوابة دفع
                      </button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {currencies.map(curr => (
                        <div key={curr.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                           <div className="flex items-center gap-5 mb-8">
                              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center font-black text-2xl shadow-sm overflow-hidden">
                                {curr.iconUrl ? (
                                  <img src={curr.iconUrl} alt={curr.name} className="w-full h-full object-cover" />
                                ) : (
                                  curr.name[0]
                                )}
                              </div>
                              <div>
                                 <h4 className="text-lg font-black text-gray-800">{curr.name}</h4>
                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{curr.network}</span>
                              </div>
                           </div>
                           <div className="space-y-4 mb-8">
                              <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center">
                                 <span className="text-[10px] text-gray-400 font-bold">السعر المقابل:</span>
                                 <span className="text-sm font-black text-blue-600">${curr.price}</span>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-2xl">
                                 <span className="text-[10px] text-gray-400 font-bold block mb-1">عنوان المحفظة:</span>
                                 <span className="text-[11px] font-black text-gray-800 truncate block">{curr.address}</span>
                              </div>
                           </div>
                           <div className="flex gap-2 text-center">
                              <button 
                                onClick={() => handleEditCurrency(curr)}
                                className="flex-1 bg-gray-50 text-gray-500 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                              >
                                <Edit3 size={16} /> تعديل
                              </button>
                              <button 
                                onClick={() => handleDeleteCurrency(curr.id)}
                                className="w-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                              >
                                <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {activeTab === 'tasks' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-gray-800 tracking-tighter">أكواد المهام المبرمجة</h2>
                      <button className="bg-gray-900 text-white px-8 py-3.5 rounded-[22px] font-black text-xs flex items-center gap-2 shadow-xl">
                        <Plus size={18} /> إنشاء كود ذكي
                      </button>
                   </div>
                   <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الكود البرمجي</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">المنصة الهدف</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الكمية المتاحة</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">قيمة المكافأة</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">التحكم</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskCodes.map(code => (
                              <tr key={code.id} className="border-b last:border-0 border-gray-50">
                                <td className="p-6">
                                   <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-sm text-center border border-blue-100">
                                      {code.code}
                                   </div>
                                </td>
                                <td className="p-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{code.platform}</td>
                                <td className="p-6 font-black text-gray-800">{code.tasksCount}</td>
                                <td className="p-6 font-black text-emerald-600">${code.rewardPerTask.toFixed(2)}</td>
                                <td className="p-6">
                                   <div className="flex gap-2">
                                      <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                                      <button className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                   </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                   </div>
                </motion.div>
              )}

              {activeTab === 'vip-levels' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-gray-800 tracking-tighter">مستويات VIP والأرباح</h2>
                   </div>
                   <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">المستوى</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">مبلغ الإيداع</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">مهام/يوم</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الربح/مهمة</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الحد الأقصى/يوم</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">مكافأة الداعي</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">تعديل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vipLevels.map(level => (
                              <tr key={level.id} className="border-b last:border-0 border-gray-50">
                                <td className="p-6 font-black text-gray-800">{level.name}</td>
                                <td className="p-6 font-bold text-gray-600">${level.price}</td>
                                <td className="p-6 font-bold text-gray-600">{level.tasksPerDay}</td>
                                <td className="p-6 font-bold text-emerald-600">${level.rewardPerTask}</td>
                                <td className="p-6 font-black text-gray-800">${(level.tasksPerDay * level.rewardPerTask).toFixed(2)}</td>
                                <td className="p-6 font-black text-blue-600">${level.referralBonus}</td>
                                <td className="p-6">
                                   <button 
                                      onClick={() => {
                                        setPromptModal({
                                          isOpen: true,
                                          title: `تعديل إعدادات ${level.name}`,
                                          description: 'الرجاء إدخال الربح لكل مهمة ومكافأة الإحالة:',
                                          type: 'double_number',
                                          value: String(level.rewardPerTask),
                                          value2: String(level.referralBonus),
                                          label1: 'الربح لكل مهمة ($)',
                                          label2: 'مكافأة الإحالة ($)',
                                          onConfirm: (val1, val2) => {
                                            if (val1 && val2) {
                                              databaseService.saveVipLevel({
                                                ...level,
                                                rewardPerTask: parseFloat(val1),
                                                referralBonus: parseFloat(val2)
                                              });
                                              refreshData();
                                            }
                                          }
                                        });
                                      }}
                                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                   >
                                      <Edit3 size={14} /> تعديل
                                   </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                   </div>
                </motion.div>
              )}

              {activeTab === 'daily-codes' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-gray-800 tracking-tighter">أكواد الدخول اليومية المهام</h2>
                   </div>
                   <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50/50">
                            <tr>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الموظف</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">توليد كود اليوم</th>
                              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الأكواد السابقة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                              const userCodes = dailyCodes.filter(c => c.userId === user.id);
                              const today = new Date().toISOString().split('T')[0];
                              const hasTodayCode = userCodes.some(c => c.date === today);
                              
                              return (
                                <tr key={user.id} className="border-b last:border-0 border-gray-50">
                                  <td className="p-6 font-black text-gray-800">{user.name} ({user.email})</td>
                                  <td className="p-6">
                                     {!hasTodayCode ? (
                                        <button 
                                          onClick={() => {
                                            databaseService.generateDailyCode(user.id);
                                            refreshData();
                                          }}
                                          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs"
                                        >
                                          إنشاء كود إنجاز مہام
                                        </button>
                                     ) : (
                                        <span className="text-xs font-bold text-gray-400">تم إنشاء كود اليوم: {userCodes.find(c => c.date === today)?.code}</span>
                                     )}
                                  </td>
                                  <td className="p-6 text-xs text-gray-400">
                                     {userCodes.length} أكواد مولدة
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                   </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                   <h2 className="text-2xl font-black text-gray-800 tracking-tighter mb-8">إعدادات المنصة</h2>
                   <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm max-w-3xl">
                      <div className="space-y-10">
                         <div>
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                               <Bell size={14} className="text-blue-500" /> إعلان النظام العام (Pop-up)
                            </label>
                            <textarea 
                                value={maintenanceMsg}
                                onChange={(e) => setMaintenanceMsg(e.target.value)}
                                placeholder="مثلاً: تنبيه! يوجد تحديث في رصيد VIP..."
                                className="w-full h-48 p-8 bg-gray-50 border border-gray-100 rounded-[32px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 font-bold text-sm leading-relaxed transition-all"
                            />
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col gap-4">
                               <h4 className="text-xs font-black text-gray-800">حالة الصيانة</h4>
                               <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-gray-400">تحويل الموقع لوضع الصيانة</span>
                                  <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                  </div>
                               </div>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col gap-4">
                               <h4 className="text-xs font-black text-gray-800">معدل العمولات</h4>
                               <div className="flex items-center gap-3">
                                  <input 
                                    type="text" 
                                    value={commission} 
                                    onChange={(e) => setCommission(parseInt(e.target.value) || 0)} 
                                    className="w-16 p-2 bg-white border border-gray-100 rounded-xl text-center font-black text-xs" 
                                  />
                                  <span className="text-[10px] font-bold text-gray-400">% عمولة السحب</span>
                               </div>
                            </div>
                         </div>

                         <button 
                            onClick={handleUpdateMaintenance}
                            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all"
                         >
                           تحديث وحفظ الإعدادات
                         </button>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Currency Management Modal */}
      <AnimatePresence>
        {currencyModal.isOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-black text-gray-800">إعدادات العملة</h3>
                 <button onClick={() => setCurrencyModal({ isOpen: false, currency: null })} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 mr-2">اسم العملة (مثلاً: USDT)</label>
                       <input 
                         type="text"
                         value={currencyModal.currency?.name || ''}
                         onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency!, name: e.target.value }})}
                         className="w-full py-4 px-6 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[22px] text-sm font-bold transition-all outline-none"
                         placeholder="اسم العملة"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 mr-2">الشبكة (Network)</label>
                       <input 
                         type="text"
                         value={currencyModal.currency?.network || ''}
                         onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency!, network: e.target.value }})}
                         className="w-full py-4 px-6 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[22px] text-sm font-bold transition-all outline-none"
                         placeholder="مثلاً: TRC20"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 mr-2">عنوان المحفظة (Address)</label>
                       <input 
                         type="text"
                         value={currencyModal.currency?.address || ''}
                         onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency!, address: e.target.value }})}
                         className="w-full py-4 px-6 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[22px] text-[11px] font-bold transition-all outline-none"
                         placeholder="لصق العنوان هنا"
                       />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 mr-2">رابط أيقونة العملة (Image URL)</label>
                       <input 
                         type="text"
                         value={currencyModal.currency?.iconUrl || ''}
                         onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency!, iconUrl: e.target.value }})}
                         className="w-full py-4 px-6 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[22px] text-sm font-bold transition-all outline-none"
                         placeholder="رابط الصورة (png/jpg)"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 mr-2">رابط QR Code (اختياري)</label>
                       <input 
                         type="text"
                         value={currencyModal.currency?.qrUrl || ''}
                         onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency!, qrUrl: e.target.value }})}
                         className="w-full py-4 px-6 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[22px] text-sm font-bold transition-all outline-none"
                         placeholder="رابط صورة الكود"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 mr-2">السعر (Price in USD)</label>
                       <input 
                         type="number"
                         value={currencyModal.currency?.price || '1.00'}
                         onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency!, price: e.target.value }})}
                         className="w-full py-4 px-6 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-100 rounded-[22px] text-sm font-bold transition-all outline-none"
                         placeholder="1.00"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={handleSaveCurrency}
                  className="flex-1 py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-blue-600/30 active:scale-95 transition-all"
                 >
                   حفظ التغييرات
                 </button>
                 <button 
                  onClick={() => setCurrencyModal({ isOpen: false, currency: null })}
                  className="px-10 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-sm active:scale-95 transition-all"
                 >
                   إلغاء
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prompt / Custom Modal */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] shadow-2xl p-8 w-full max-w-sm "
          >
            <h3 className="text-xl font-black text-gray-800 mb-2">{promptModal.title}</h3>
            <p className="text-sm font-bold text-gray-400 mb-6">{promptModal.description}</p>
            
            {promptModal.type === 'number' || promptModal.type === 'text' ? (
              <input 
                type={promptModal.type === 'number' ? 'number' : 'text'}
                value={promptModal.value}
                onChange={(e) => setPromptModal({ ...promptModal, value: e.target.value })}
                className="w-full py-4 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold mb-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-center"
                autoFocus
                placeholder="أدخل القيمة"
              />
            ) : null}

            {promptModal.type === 'double_number' && (
              <div className="space-y-4 mb-6">
                 <div>
                   <label className="text-xs font-bold text-gray-400 block mb-2">{promptModal.label1}</label>
                   <input 
                    type="number"
                    value={promptModal.value}
                    onChange={(e) => setPromptModal({ ...promptModal, value: e.target.value })}
                    className="w-full py-3 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-center"
                    autoFocus
                  />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-400 block mb-2">{promptModal.label2}</label>
                   <input 
                    type="number"
                    value={promptModal.value2}
                    onChange={(e) => setPromptModal({ ...promptModal, value2: e.target.value })}
                    className="w-full py-3 px-6 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-center"
                  />
                 </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  promptModal.onConfirm(promptModal.value, promptModal.value2);
                  setPromptModal({ ...promptModal, isOpen: false });
                }}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
              >
                تأكيد
              </button>
              <button 
                onClick={() => setPromptModal({ ...promptModal, isOpen: false })}
                className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

