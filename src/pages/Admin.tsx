import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, TrendingUp, DollarSign, Settings, ShieldCheck, 
  AlertCircle, ArrowUpRight, UserPlus, Layout, Activity, 
  History, ShieldAlert, Star, Search, Filter, CheckCircle, 
  XCircle, MoreVertical, Plus, Trash2, Edit3, Globe, Bell, 
  Ban, Gift, Mail, Camera, MessageSquare, Send, Eye, Check, X, Sparkles, Menu, LogOut, ChevronRight, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ZeaLogo from '../components/ZeaLogo';
import LazyImage from '../components/LazyImage';
import { databaseService, Currency, TaskCode, Transaction, User, TaskRecord, ChatMessage, VipLevel, UserDailyCode } from '../services/databaseService';

// Extract components to be reusable
const StatCard = ({ title, value, subValue, icon: Icon, colorClass, bgClass, trendUp = true }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-blue-100 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
        {subValue}
      </div>
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <div className="text-2xl font-black text-gray-800 tracking-tight">{value}</div>
  </div>
);

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab ] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data States
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [taskCodes, setTaskCodes] = useState<TaskCode[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>([]);
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [dailyCodes, setDailyCodes] = useState<UserDailyCode[]>([]);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [commission, setCommission] = useState(19);
  const [withdrawalDelay, setWithdrawalDelay] = useState(24);

  // Chat States
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // Modals
  const [currencyModal, setCurrencyModal] = useState<{isOpen: boolean; currency: Partial<Currency> | null;}>({ isOpen: false, currency: null });
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean; title: string; description: string; type: 'number' | 'text' | 'confirm' | 'double_number';
    value: string; value2?: string; label1?: string; label2?: string; onConfirm: (val: string, val2?: string) => void;
  }>({ isOpen: false, title: '', description: '', type: 'text', value: '', onConfirm: () => {} });

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const refreshData = () => {
    setCurrencies(databaseService.getCurrencies());
    setTaskCodes(databaseService.getTaskCodes());
    setTransactions(databaseService.getTransactions());
    setUsers(databaseService.getUsers());
    setTaskRecords(databaseService.getTaskRecords());
    setVipLevels(databaseService.getVipLevels());
    setDailyCodes(databaseService.getDailyCodes());
    setMaintenanceMsg(databaseService.getMaintenanceMessage());
    if (selectedChatUser) setChatMessages(databaseService.getChatMessages(selectedChatUser.id));
  };

  useEffect(() => {
    const user = databaseService.getCurrentUser();
    if (!user || (user.email !== 'admin@zea.com' && !user.phoneNumber?.includes('07751889723'))) {
      navigate('/home');
      return;
    }
    refreshData();
    setCommission(databaseService.getWithdrawalCommission());
    setWithdrawalDelay(databaseService.getWithdrawalDelayHours());
    setMaintenanceMsg(databaseService.getMaintenanceMessage());
    const interval = setInterval(refreshData, 5000); 
    return () => clearInterval(interval);
  }, [selectedChatUser, navigate]);

  // Derived metrics
  const pendingTasks = useMemo(() => taskRecords.filter(r => r.status === 'pending'), [taskRecords]);
  const pendingWithdrawals = useMemo(() => transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending'), [transactions]);
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || (u.phoneNumber && u.phoneNumber.includes(q)));
  }, [users, searchQuery]);

  // Handlers
  const handleUpdateMaintenance = () => {
    databaseService.setMaintenanceMessage(maintenanceMsg);
    databaseService.setWithdrawalCommission(commission);
    databaseService.setWithdrawalDelayHours(withdrawalDelay);
    toast.success('تم تحديث إعدادات النظام بنجاح');
  };

  const handleTxAction = (id: string, status: 'completed' | 'failed') => {
    databaseService.updateTransactionStatus(id, status);
    refreshData();
    toast.success(status === 'completed' ? 'تم الموافقة على الطلب' : 'تم رفض الطلب');
  };

  const [globalDailyCode, setGlobalDailyCode] = useState('');

  const broadcastDailyCode = () => {
    if (!globalDailyCode.trim()) return;
    const allUsers = databaseService.getUsers();
    let sentCount = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if code was already sent today
    const existingCodes = databaseService.getDailyCodes();
    
    allUsers.forEach(user => {
      if (user.status === 'active' && user.email !== 'admin@zea.com') {
         // Create daily code for user
         const codesList = databaseService.getDailyCodes();
         const isAlreadyGot = codesList.some(c => c.code === globalDailyCode && c.userId === user.id);
         if (!isAlreadyGot) {
           codesList.push({
             id: `DCODE-${Date.now()}-${user.id}`,
             userId: user.id,
             code: globalDailyCode,
             date: today,
             isUsed: false
           });
           localStorage.setItem('zea_daily_codes', JSON.stringify(codesList));
           
           // Send chat message
           databaseService.sendChatMessage({
             userId: user.id,
             sender: 'admin',
             text: `كود المهام اليومي الجديد هو: ${globalDailyCode}\nنافذة المهام مفتوحة فقط من 2:10 إلى 4:00 مساءً.`
           });
           
           sentCount++;
         }
      }
    });

    toast.success(`تم بث الكود اليومي لـ ${sentCount} مستخدم نشط بنجاح`);
    setGlobalDailyCode('');
  };
  const handleTaskAction = (id: string, status: 'approved' | 'rejected') => {
    databaseService.updateTaskStatus(id, status);
    refreshData();
    toast.success(status === 'approved' ? 'تم اعتماد المهمة الدفع' : 'تم رفض المهمة');
  };

  const handleSaveCurrency = () => {
    const c = currencyModal.currency;
    if (!c?.name || !c?.network || !c?.address || !c?.price) {
       toast.error("يرجى تعبئة جميع الحقول المطلوبة");
       return;
    }
    const newCurrency: Currency = {
      id: c.id || `CURR-${Date.now()}`,
      name: c.name,
      network: c.network,
      address: c.address,
      qrUrl: c.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${c.address}`,
      iconUrl: c.iconUrl,
      price: c.price,
      isActive: c.isActive !== undefined ? c.isActive : true
    };
    databaseService.saveCurrency(newCurrency);
    refreshData();
    toast.success("تم حفظ العملة بنجاح");
    setCurrencyModal({ isOpen: false, currency: null });
  };
  
  const handleDeleteCurrency = (id: string) => {
    databaseService.deleteCurrency(id);
    refreshData();
    toast.success("تم الحذف بنجاح");
  };

  const handleBalanceAdjust = (user: User) => {
    setPromptModal({
      isOpen: true, title: 'تعديل الرصيد', description: `قيمة التعديل (بالسالب للخصم) لـ ${user.name}`,
      type: 'number', value: '',
      onConfirm: (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return;
        databaseService.saveUser({ ...user, balance: user.balance + num });
        databaseService.createTransaction({ userId: user.id, amount: Math.abs(num), type: num >= 0 ? 'deposit' : 'withdrawal', status: 'completed' });
        refreshData();
        toast.success(`تم ${num >= 0 ? 'إضافة' : 'خصم'} ${Math.abs(num)}$`);
      }
    });
  };

  const handleHonorAdjust = (user: User) => {
    setPromptModal({
      isOpen: true, title: 'تعديل نقاط الشرف', description: `القيمة (بالسالب للخصم) لـ ${user.name}`,
      type: 'number', value: '',
      onConfirm: (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return;
        databaseService.saveUser({ ...user, honorPoints: user.honorPoints + num });
        refreshData();
        toast.success(`تم ${num >= 0 ? 'إضافة' : 'خصم'} ${Math.abs(num)} نقطة شرف`);
      }
    });
  };

  const handleSuspend = (user: User) => {
    setPromptModal({
      isOpen: true, title: 'إيقاف مؤقت', description: `أدخل عدد الساعات للإيقاف لـ ${user.name}`,
      type: 'number', value: '',
      onConfirm: (val) => {
        const hours = parseFloat(val);
        if (isNaN(hours) || hours <= 0) return;
        const suspendedUntil = new Date(Date.now() + hours * 3600000).toISOString();
        databaseService.saveUser({ ...user, status: 'suspended', suspendedUntil });
        refreshData();
        toast.success(`تم إيقاف حساب ${user.name} لمدة ${hours} ساعة`);
      }
    });
  };

  // UI Components
  const SidebarNavItem = ({ id, label, icon: Icon, count }: any) => {
    const active = activeTab === id;
    return (
      <button 
        onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} strokeWidth={active ? 2.5 : 2} />
          <span>{label}</span>
        </div>
        {count > 0 && (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>{count}</span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed lg:sticky top-0 right-0 h-[100dvh] w-72 bg-white border-l border-gray-100 z-50 flex flex-col transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg flex items-center justify-center">
              <ZeaLogo className="scale-50 text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 leading-tight">لوحة الإدارة</h1>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Admin Control</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          <SidebarNavItem id="dashboard" label="نظرة عامة" icon={Layout} />
          <SidebarNavItem id="users" label="إدارة المستخدمين" icon={Users} />
          <SidebarNavItem id="task-review" label="مراجعة المهام" icon={Camera} count={pendingTasks.length} />
          <SidebarNavItem id="finance" label="العمليات المالية" icon={DollarSign} count={pendingWithdrawals.length} />
          <SidebarNavItem id="messaging" label="الدعم والمراسلات" icon={MessageSquare} />
          <SidebarNavItem id="currencies" label="طرق الدفع" icon={Globe} />
          <SidebarNavItem id="tasks" label="تكوين المهام" icon={Activity} />
          <SidebarNavItem id="vip-levels" label="باقات VIP" icon={Star} />
          <SidebarNavItem id="settings" label="إعدادات المنصة" icon={Settings} />
        </div>

        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">AD</div>
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-900">مدير النظام المركز</div>
              <div className="text-[10px] text-emerald-600 font-medium">متصل وآمن</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              {activeTab === 'dashboard' ? 'مرحباً بك في لوحة التحكم المركزية' : 
               activeTab === 'users' ? 'إدارة أعضاء المنصة' : 
               activeTab === 'task-review' ? 'مراجعة وتأكيد مهام الأعضاء' : 
               activeTab === 'finance' ? 'الإيداعات والسحوبات' : 'النظام'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-gray-50 p-1.5 rounded-lg border border-gray-100">
              <button className="p-2 text-gray-400 hover:text-blue-600 rounded-md transition-colors relative">
                <Bell size={18} />
                {(pendingTasks.length > 0 || pendingWithdrawals.length > 0) && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
              </button>
            </div>
            <button onClick={() => { navigate('/home'); }} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors">
              <LogOut size={16} /> <span>خروج للواجهة</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              
              {/* DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard title="إجمالي الأعضاء" value={users.length} subValue="النشطين" icon={Users} colorClass="text-blue-600" bgClass="bg-blue-50" />
                    <StatCard title="مهام معلقة" value={pendingTasks.length} subValue="يتطلب تدخل" icon={Camera} colorClass="text-amber-600" bgClass="bg-amber-50" trendUp={false} />
                    <StatCard title="طلبات السحب" value={pendingWithdrawals.length} subValue="معلق" icon={DollarSign} colorClass="text-rose-600" bgClass="bg-rose-50" />
                    <StatCard title="إجمالي العمليات" value={transactions.length} subValue="حركة" icon={Activity} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">أحدث الحركات المالية</h3>
                        <button onClick={() => setActiveTab('finance')} className="text-sm font-medium text-blue-600 hover:text-blue-700">عرض السجل كاملاً</button>
                      </div>
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100/50 transition-colors">
                            <div className="flex items-center gap-4 text-right">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-blue-100 text-blue-600' : tx.type === 'withdrawal' ? 'bg-rose-100 text-rose-600' : 'bg-purple-100 text-purple-600'}`}>
                                {tx.type === 'deposit' ? <ArrowUpRight size={18} /> : tx.type === 'withdrawal' ? <TrendingUp className="rotate-180" size={18} /> : <Sparkles size={18}/>}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">{tx.type === 'deposit' ? 'إيداع رصيد' : tx.type === 'withdrawal' ? 'طلب سحب' : 'ترقية VIP'}</h4>
                                <span className="text-[11px] text-gray-500">{new Date(tx.createdAt).toLocaleString('ar-EG')} • {tx.userId}</span>
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="text-base font-black text-gray-900 tracking-tight">${tx.amount.toFixed(2)}</div>
                              <div className={`text-[11px] font-bold ${tx.status === 'completed' ? 'text-emerald-600' : tx.status === 'pending' ? 'text-amber-600' : 'text-rose-600'}`}>
                                {tx.status === 'completed' ? 'مكتمل' : tx.status === 'pending' ? 'يعالج' : 'مرفوض'}
                              </div>
                            </div>
                          </div>
                        ))}
                        {transactions.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">لا توجد عمليات مسجلة</div>}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4"><ShieldCheck size={32} /></div>
                        <h3 className="text-xl font-black text-gray-900">نظام محمي وآمن</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">قاعدة البيانات متصلة وتعمل بأداء عالي. التزامن مفعل بشكل فوري لجميع طلبات المستخدمين.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" placeholder="بحث باسم أو معرف أو رقم..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full py-2.5 pr-10 pl-4 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">المستخدم</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">الهاتف</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">الرصيد الكلي</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">الحالة</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">إجراءات سريعة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">{u.name.slice(0,2)}</div>
                                  <div>
                                    <div className="font-bold text-gray-900">{u.name}</div>
                                    <div className="text-[11px] text-gray-500 font-mono tracking-wideset">{u.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{u.phoneNumber || 'لا يوجد'}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-gray-900">${u.balance.toFixed(2)}</span>
                                  <span className="text-[10px] text-emerald-600 bg-emerald-50 w-fit px-2 rounded-full">{u.honorPoints} شرف</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : u.status === 'suspended' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                  {u.status === 'active' ? 'نشط' : u.status === 'suspended' ? 'موقوف' : 'محظور'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button onClick={() => handleBalanceAdjust(u)} className="p-1.5 text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors" title="إضافة/خصم الرصيد"><DollarSign size={16} /></button>
                                  <button onClick={() => handleHonorAdjust(u)} className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors" title="نقاط الشرف"><Activity size={16} /></button>
                                  <button onClick={() => handleSuspend(u)} className="p-1.5 text-amber-600 bg-amber-50 rounded hover:bg-amber-100 transition-colors" title="توقيف مؤقت"><Clock size={16} /></button>
                                  <button onClick={() => { databaseService.saveUser({...u, status: u.status === 'active' ? 'banned' : 'active'}); refreshData(); }} className={`p-1.5 rounded transition-colors ${u.status==='active' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`} title="إيقاف نهائي/فك الحظر">
                                    {u.status==='active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                  </button>
                                  <button onClick={() => { setActiveTab('messaging'); setSelectedChatUser(u); }} className="p-1.5 text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors" title="مراسلة"><MessageSquare size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredUsers.length === 0 && <div className="p-8 text-center text-gray-500">لا يوجد مستخدمين لعرضهم</div>}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SETTINGS */}
              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">إعدادات المنصة المتقدمة</h2>
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                    <div className="space-y-8">
                      {/* Commission */}
                      <div className="pb-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2"><DollarSign size={18} className="text-blue-600"/> رسوم وعمولات السحب</h3>
                          <p className="text-xs text-gray-500 mb-4">النسبة المئوية العكسية المخصومة.</p>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number" 
                              className="bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-32"
                              value={commission}
                              onChange={(e) => setCommission(parseInt(e.target.value)||0)}
                            />
                            <span className="text-gray-600 font-semibold">%</span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2"><Clock size={18} className="text-purple-600"/> مدة تنفيذ أوامر السحب</h3>
                          <p className="text-xs text-gray-500 mb-4">المدة الزمنية لوصول الأموال لمحفظة العميل.</p>
                          <select
                            className="bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
                            value={withdrawalDelay}
                            onChange={(e) => setWithdrawalDelay(parseInt(e.target.value))}
                          >
                            <option value={0}>فوري (نفس الدقيقة)</option>
                            <option value={24}>بعد يوم (24 ساعة)</option>
                            <option value={48}>بعد يومين (48 ساعة)</option>
                            <option value={72}>بعد 3 أيام (72 ساعة)</option>
                          </select>
                        </div>
                      </div>

                      {/* Maintenance Msg */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2"><AlertCircle size={18} className="text-amber-500"/> رسالة تنبيه النظام (لجميع المستخدمين)</h3>
                        <p className="text-xs text-gray-500 mb-4">في حال وجود رسالة هامة أو تحديثات، صغ الرسالة هنا وستظهر كنطاق تنبيهي لجميع الأعضاء.</p>
                        <textarea 
                          rows={4}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none resize-none transition-all"
                          placeholder="اكتب التنبيه النظامي..."
                          value={maintenanceMsg}
                          onChange={(e) => setMaintenanceMsg(e.target.value)}
                        />
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={handleUpdateMaintenance}
                          className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
                        >
                          تحديث وحفظ الإعدادات بأمان
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TASK REVIEW */}
              {activeTab === 'task-review' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">مراجعة المهام</h2>
                      <p className="text-sm text-gray-500 mt-1">دقق إثباتات المهام ووافق على المكافآت</p>
                    </div>
                    <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-bold text-sm">
                      مهام متأخرة: {pendingTasks.length}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingTasks.map(record => (
                      <div key={record.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="aspect-video relative bg-black flex items-center justify-center">
                          {record.screenshotUrl ? (
                            <img src={record.screenshotUrl} alt="Screenshot" className="w-full h-full object-cover max-h-48" />
                          ) : (
                            <span className="text-gray-500 text-sm">لا يوجد صورة إثبات</span>
                          )}
                          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-bold tracking-widest uppercase">
                            {record.platform}
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <div className="text-sm font-bold text-gray-900">{record.userId}</div>
                               <div className="text-[11px] text-gray-500">{new Date(record.createdAt).toLocaleString('ar-EG')}</div>
                            </div>
                            <div className="text-emerald-600 font-bold bg-emerald-50 px-2 rounded">${record.reward.toFixed(2)}</div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => handleTaskAction(record.id, 'approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-1"><Check size={16}/> قبول</button>
                             <button onClick={() => handleTaskAction(record.id, 'rejected')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-1"><X size={16}/> رفض</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingTasks.length === 0 && <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">لم يتم العثور على مهام معلقة</div>}
                  </div>
                </motion.div>
              )}

              {/* FINANCE */}
              {activeTab === 'finance' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">سجل العمليات المالية الشامل</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">النوع</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">المبلغ</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">بيانات المحفظة</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">المستخدم</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">الحالة</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {transactions.slice().reverse().map(tx => (
                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${tx.type === 'deposit' ? 'bg-blue-50 text-blue-700' : tx.type === 'withdrawal' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                                  {tx.type === 'deposit' ? 'إيداع' : tx.type === 'withdrawal' ? 'سحب' : 'ترقية VIP'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-900">${tx.amount.toFixed(2)}
                                {tx.fee && <div className="text-[10px] text-red-500 mt-1">خصم {tx.fee}%</div>}
                              </td>
                              <td className="px-6 py-4">
                                {tx.type === 'withdrawal' && (
                                  <div className="text-xs">
                                     <span className="font-bold text-blue-600 block">{tx.walletNetwork||'TRC20'}</span>
                                     <span className="text-gray-500 font-mono tracking-tighter truncate block max-w-xs">{tx.networkAddress||'N/A'}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-gray-500">{tx.userId}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : tx.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'}`}>
                                  {tx.status === 'completed' ? 'اكتمل' : tx.status === 'failed' ? 'مرفوض' : 'قيد المراجعة'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {tx.status === 'pending' && (
                                  <div className="flex gap-2">
                                     <button onClick={() => handleTxAction(tx.id, 'completed')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"><Check size={16} /></button>
                                     <button onClick={() => handleTxAction(tx.id, 'failed')} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"><X size={16} /></button>
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

              {/* MESSAGING */}
              {activeTab === 'messaging' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-[calc(100vh-140px)] flex gap-6">
                  <div className="w-80 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden shrink-0 hidden lg:flex">
                    <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-900">المحادثات</h3></div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {users.map(u => (
                        <button key={u.id} onClick={() => setSelectedChatUser(u)} className={`w-full text-right p-3 justify-start rounded-xl flex items-center gap-3 transition-colors ${selectedChatUser?.id === u.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">{u.name.slice(0,2)}</div>
                          <div className="overflow-hidden">
                            <div className="text-sm font-bold truncate">{u.name}</div>
                            <div className="text-[10px] opacity-70 truncate font-mono">{u.id}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    {selectedChatUser ? (
                      <>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-gray-900">{selectedChatUser.name} <span className="text-xs text-gray-500 font-normal ml-2">{selectedChatUser.phoneNumber}</span></div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                          {chatMessages.map(msg => (
                            <div key={msg.id} className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${msg.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-none self-start mr-auto' : 'bg-gray-100 text-gray-900 rounded-tl-none ml-auto'}`}>
                              {msg.text}
                              <div className={`mt-1 text-[9px] opacity-70 ${msg.sender === 'admin' ? 'text-blue-100 text-right' : 'text-gray-500 text-left'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-white">
                           <div className="flex gap-2">
                             <input type="text" value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==='Enter' && databaseService.sendChatMessage({userId: selectedChatUser.id, sender:'admin', text:replyText})} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600" placeholder="رسالتك للمستخدم..." />
                             <button onClick={() => { if(replyText && selectedChatUser) { databaseService.sendChatMessage({userId: selectedChatUser.id, sender:'admin', text:replyText}); setReplyText(''); refreshData(); } }} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"><Send size={18} /></button>
                           </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p>اختر مستخدم من القائمة للبدء بالمحادثة المباشرة</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* CURRENCIES */}
              {activeTab === 'currencies' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">طرق الدفع والعملات</h2>
                      <p className="text-sm text-gray-500 mt-1">إضافة وإدارة محافظ الإيداع</p>
                    </div>
                    <button onClick={() => setCurrencyModal({ isOpen: true, currency: {} })} className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm">
                      <Plus size={16} /> إضافة عملة
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currencies.map(curr => (
                      <div key={curr.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600 text-lg shadow-sm border border-blue-100 overflow-hidden">
                             {curr.iconUrl ? <img src={curr.iconUrl} className="w-full h-full object-cover" alt="" /> : curr.name[0]}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 leading-tight">{curr.name}</h4>
                            <span className="text-[10px] text-gray-500 font-mono">{curr.network}</span>
                          </div>
                        </div>
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between bg-gray-50 text-xs px-3 py-2 rounded-lg border border-gray-100">
                             <span className="text-gray-500 font-bold">السعر</span>
                             <span className="text-blue-600 font-black">${curr.price}</span>
                          </div>
                          <div className="bg-gray-50 text-[10px] px-3 py-2 rounded-lg border border-gray-100 font-mono tracking-tighter truncate">
                             {curr.address}
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setCurrencyModal({ isOpen: true, currency: curr })} className="flex-1 text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold transition-colors">تعديل العملة</button>
                           <button onClick={() => handleDeleteCurrency(curr.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-2 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TASKS */}
              {activeTab === 'tasks' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">إدارة المهام والأكواد</h2>
                      <p className="text-sm text-gray-500 mt-1">تكوين عوائد المهام وتوزيعها</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-right text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold text-gray-600">الكود</th>
                          <th className="px-6 py-4 font-semibold text-gray-600">المنصة</th>
                          <th className="px-6 py-4 font-semibold text-gray-600">عدد المهام</th>
                          <th className="px-6 py-4 font-semibold text-gray-600">العائد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                         {taskCodes.map(code => (
                           <tr key={code.id} className="hover:bg-gray-50/50">
                             <td className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold">{code.code}</span></td>
                             <td className="px-6 py-4 text-gray-600 uppercase font-bold text-xs">{code.platform}</td>
                             <td className="px-6 py-4 font-bold text-gray-800">{code.tasksCount}</td>
                             <td className="px-6 py-4 font-bold text-emerald-600">${code.rewardPerTask.toFixed(2)}</td>
                           </tr>
                         ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* VIP LEVELS & DAILY CODES */}
              {['vip-levels', 'daily-codes'].includes(activeTab) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl">
                  {activeTab === 'vip-levels' && (
                  <>
                  <div className="flex justify-between items-center bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">إعدادات باقات VIP</h2>
                      <p className="text-sm text-gray-500 mt-1">تحكم بمكافآت الترقية</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 text-center text-gray-500">
                     <p className="text-sm font-bold max-w-sm mx-auto leading-relaxed">
                        يتم إدارة الباقات ومستويات المستخدمين من خلفية قواعد البيانات مسبقاً بما يحافظ على تناسق المنصة وفقاً لخطط التسويق المعتمدة.
                     </p>
                  </div>
                  </>
                  )}

                  {activeTab === 'daily-codes' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">إصدار الكود اليومي</h2>
                        <p className="text-sm text-gray-500 mt-1">بث كود المهام لجميع الأعضاء برسالة موحدة</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <Gift size={24} />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8">
                       <div className="space-y-4 max-w-lg mx-auto">
                         <div className="text-center">
                           <h3 className="text-lg font-bold text-gray-900 mb-2">إرسال كود موحد جديد</h3>
                           <p className="text-xs text-gray-500 mb-6">سيتم إرسال هذا الكود إلى جميع المستخدمين النشطين برسالة شخصية، وسيرتبط بصلاحية نافذة التنفيذ اليومية (٢:١٠ م إلى ٤:٠٠ م).</p>
                         </div>
                         <div className="flex gap-3">
                           <input 
                             type="text" 
                             value={globalDailyCode}
                             onChange={e => setGlobalDailyCode(e.target.value)}
                             className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 font-mono font-bold text-center tracking-widest uppercase focus:ring-2 focus:ring-blue-600 outline-none"
                             placeholder="DCODE-XYZ"
                           />
                           <button onClick={broadcastDailyCode} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                             <Send size={18} /> بث الكود
                           </button>
                         </div>
                       </div>
                    </div>
                  </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Prompts Overlay */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{promptModal.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{promptModal.description}</p>
            <input 
              type={promptModal.type === 'number' ? 'number' : 'text'}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none mb-6"
              value={promptModal.value}
              onChange={e => setPromptModal({...promptModal, value: e.target.value})}
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { promptModal.onConfirm(promptModal.value); setPromptModal({...promptModal, isOpen: false}); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-bold transition-colors"
               >تأكيد الإجراء</button>
              <button onClick={() => setPromptModal({...promptModal, isOpen: false})} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-3 text-sm font-bold transition-colors"
                >إلغاء</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Currency Modal Overlay */}
      {currencyModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{currencyModal.currency?.id ? 'تعديل عملة' : 'إضافة عملة جديدة'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">اسم العملة (مثال USDT)</label>
                <input type="text" value={currencyModal.currency?.name || ''} onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency, name: e.target.value } })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">الشبكة (مثال TRC20)</label>
                <input type="text" value={currencyModal.currency?.network || ''} onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency, network: e.target.value } })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">السعر / التعرفة (أدخل رقم، مثال 1.00)</label>
                <input type="number" step="0.01" value={currencyModal.currency?.price || ''} onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency, price: e.target.value } })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">عنوان المحفظة</label>
                <input type="text" value={currencyModal.currency?.address || ''} onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency, address: e.target.value } })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">رابط صورة/لوجو العملة (اختياري)</label>
                <input type="text" value={currencyModal.currency?.iconUrl || ''} onChange={(e) => setCurrencyModal({ ...currencyModal, currency: { ...currencyModal.currency, iconUrl: e.target.value } })} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleSaveCurrency} className="flex-1 bg-blue-600 outline-none hover:bg-blue-700 active:scale-95 text-white rounded-lg py-3 text-sm font-bold transition-all">حفظ العملة</button>
              <button onClick={() => setCurrencyModal({ isOpen: false, currency: null })} className="flex-1 bg-gray-100 outline-none hover:bg-gray-200 active:scale-95 text-gray-700 rounded-lg py-3 text-sm font-bold transition-all">إلغاء</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
