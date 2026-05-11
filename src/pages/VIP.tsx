import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { databaseService, VipLevel, User } from '../services/databaseService';
import toast from 'react-hot-toast';

export default function VIP() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<VipLevel[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = databaseService.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    setPlans(databaseService.getVipLevels().sort((a,b) => a.price - b.price));
  }, [navigate]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'alert' });

  const handleJoin = (plan: VipLevel) => {
    const latestUser = databaseService.getCurrentUser();
    if (!latestUser) return;
    
    if (latestUser.vipLevel >= plan.level) {
      toast.error('أنت مشترك بالفعل في هذا المستوى أو مستوى أعلى.');
      return;
    }
    if (latestUser.balance < plan.price) {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title: 'رصيد غير كافٍ',
        message: `رصيدك غير كافٍ. يرجى إيداع مبلغ $${plan.price} للاشتراك في هذا المستوى. هل ترغب في الذهاب لصفحة الشحن الآن؟`,
        onConfirm: () => {
          setModalState(s => ({...s, isOpen: false}));
          navigate('/deposit');
        }
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'تأكيد الاشتراك',
      message: `هل أنت متأكد من دفع $${plan.price} للاشتراك في ${plan.name}؟`,
      onConfirm: () => {
        const u = databaseService.getCurrentUser();
        if (!u || u.balance < plan.price) {
          toast.error('رصيدك غير كافٍ لإتمام العملية');
          setModalState(s => ({...s, isOpen: false}));
          return;
        }

        const updatedUser = databaseService.updateCurrentUser({
          balance: u.balance - plan.price,
          vipLevel: plan.level
        });
        
        if (updatedUser) {
          setUser(updatedUser);
          databaseService.createTransaction({
            userId: user.id,
            amount: plan.price,
            type: 'subscription',
            status: 'completed'
          });
          if (updatedUser.referrerId) {
            const users = databaseService.getUsers();
            const referrer = users.find(u => u.id === updatedUser.referrerId);
            if (referrer) {
               databaseService.saveUser({
                 ...referrer,
                 balance: referrer.balance + plan.referralBonus
               });
               databaseService.sendNotification({
                 userId: referrer.id,
                 title: 'مكافأة دعوة!',
                 message: `تم إضافة مكافأة بقيمة $${plan.referralBonus} لاشتراك أحد أعضاء فريقك في ${plan.name}.`
               });
            }
          }
          
          setModalState({ isOpen: false, title: '', message: '', type: 'alert' });
          toast.success('تم الاشتراك بنجاح!');
        }
      }
    });
  };

  const getLevelStyle = (price: number, index: number) => {
    if (price === 600 || index === 0) return { label: 'C 1', color: 'text-[#c22bd1]' };
    if (price === 1200 || index === 1) return { label: 'C 2', color: 'text-[#9ac72c]' };
    if (price === 2600 || index === 2) return { label: 'B 1', color: 'text-[#d97034]' };
    if (price === 6000 || index === 3) return { label: 'B 2', color: 'text-[#c25225]' };
    if (price === 13000 || index === 4) return { label: 'A 1', color: 'text-[#b2a829]' };
    if (price === 28000 || index === 5) return { label: 'A 2', color: 'text-[#d6447e]' };
    if (price === 60000 || index === 6) return { label: 'S 1', color: 'text-[#e84f7b]' };
    if (price === 100000 || index === 7) return { label: 'S 2', color: 'text-[#e84f7b]' };
    return { label: `V ${index + 1}`, color: 'text-[#1a56db]' }; 
  };

  return (
    <div className="bg-[#0a0e17] text-white min-h-screen pb-24 font-sans text-right relative overflow-hidden" dir="rtl">
      
      {/* Abstract Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[10%] -left-[10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
         <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="bg-[#131b2c] text-white px-5 py-5 flex items-center justify-between sticky top-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/5">
         <div className="w-16"></div>
         <h1 className="text-lg font-black flex-1 text-center tracking-wide">الترقية (VIP)</h1>
         <Link to="/record?category=finance&tab=all" className="w-16 flex justify-end">
           <div className="border border-white/20 hover:bg-white/10 active:bg-white/20 transition-all rounded-xl px-4 py-1 text-xs font-bold shadow-inner">سجل</div>
         </Link>
      </div>

      {/* Plans Container */}
      <div className="px-5 py-8 space-y-6 relative z-10 w-full max-w-md mx-auto">
        {plans.map((plan, index) => {
          const style = getLevelStyle(plan.price, index);
          const isCurrent = user?.vipLevel === plan.level;
          const isAvailable = user && user.vipLevel <= plan.level && !isCurrent; // Allow upgrading to higher levels, disabled if same or lower

          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`relative overflow-hidden rounded-[24px] px-6 py-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border ${isCurrent ? 'border-emerald-500/50 bg-gradient-to-br from-[#131b2c] to-[#0a0e17]' : 'border-white/10 bg-[#131b2c]'}`}
            >
              {/* Highlight if current */}
              {isCurrent && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              )}
              
              <div className="relative z-10 flex flex-col h-full space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline gap-1.5">
                     <span className={`text-[32px] font-black tracking-tight ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>{plan.price}</span>
                     <span className={`text-[13px] font-bold ${isCurrent ? 'text-emerald-500/70' : 'text-gray-400'}`}>USDT</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl shadow-inner border ${isCurrent ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#0a0e17] border-white/5'}`}>
                     <span className={`text-[16px] font-black ${style.color} drop-shadow-md`}>{style.label}</span>
                  </div>
                </div>

                <div className="space-y-2">
                   <p className="text-gray-300 font-bold text-sm flex justify-between items-center bg-[#0a0e17]/50 px-4 py-2 rounded-xl border border-white/5">
                     <span>عدد المهام اليومية</span>
                     <span className="text-white font-black">{plan.tasksPerDay}</span>
                   </p>
                   <p className="text-gray-300 font-bold text-sm flex justify-between items-center bg-[#0a0e17]/50 px-4 py-2 rounded-xl border border-white/5">
                     <span>فترة الصلاحية</span>
                     <span className="text-white font-black">365 يوم</span>
                   </p>
                </div>

                <button 
                  onClick={() => handleJoin(plan)}
                  disabled={!!isCurrent || user?.vipLevel > plan.level}
                  className={`w-full py-4 rounded-xl text-[15px] font-black transition-all shadow-lg ${isCurrent ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' : (user?.vipLevel > plan.level) ? 'bg-[#0a0e17] text-gray-500 border border-white/5 cursor-not-allowed shadow-none' : 'bg-gradient-to-l from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 active:scale-95 border border-white/10'}`}
                >
                  {isCurrent ? 'الباقة الحالية' : ((user?.vipLevel > plan.level) ? 'تم الترقية' : 'تفعيل الباقة')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#131b2c] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 w-full max-w-sm overflow-hidden text-center"
          >
            <div className="p-8">
                <h3 className="text-xl font-black text-white mb-2">{modalState.title}</h3>
                <p className="text-[13px] font-bold text-gray-400 mb-8 leading-relaxed max-w-[250px] mx-auto">{modalState.message}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                        if (modalState.type === 'confirm' && modalState.onConfirm) {
                            modalState.onConfirm();
                        } else {
                            setModalState({ ...modalState, isOpen: false });
                        }
                    }}
                    className="flex-1 py-3.5 bg-gradient-to-l from-blue-600 to-indigo-600 text-white rounded-xl font-black shadow-[0_10px_30px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
                  >
                    تأكيد
                  </button>
                  {modalState.type === 'confirm' && (
                    <button 
                      onClick={() => setModalState({ ...modalState, isOpen: false })}
                      className="flex-1 py-3.5 bg-[#0a0e17] text-gray-300 border border-white/10 rounded-xl font-bold hover:bg-white/5 active:scale-95 transition-all"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
