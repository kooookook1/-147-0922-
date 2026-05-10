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
    <div className="bg-[#f0f5fc] min-h-screen pb-24 font-sans text-right relative overflow-hidden" dir="rtl">
      
      {/* Abstract Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[10%] -left-[10%] w-64 h-64 bg-blue-200/30 rounded-full blur-[80px]" />
         <div className="absolute bottom-[20%] -right-[10%] w-80 h-80 bg-blue-300/20 rounded-full blur-[100px]" />
      </div>

      <div className="bg-[#3b82f6] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
         <div className="w-16"></div>
         <h1 className="text-[17px] font-bold flex-1 text-center">شراء</h1>
         <Link to="/record?category=finance&tab=all" className="w-16 flex justify-end">
           <div className="border hover:bg-white/10 active:bg-white/20 transition-colors border-white/80 rounded-[8px] px-4 py-[3px] text-sm font-medium">سجل</div>
         </Link>
      </div>

      {/* Plans Container */}
      <div className="px-5 py-6 space-y-4 relative z-10 w-full max-w-md mx-auto">
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
              className="relative overflow-hidden rounded-[16px] px-5 py-6 bg-gradient-to-r from-[#81b2f5] to-[#c2dcf6] shadow-sm"
            >
              <div className="relative z-10 flex flex-col h-full space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-baseline gap-1">
                     <span className="text-[26px] font-black text-[#154696] tracking-tight">{plan.price}</span>
                     <span className="text-[13px] font-bold text-[#154696]">USDT</span>
                  </div>
                  <div className="bg-white px-4 py-[3px] rounded-xl shadow-sm">
                     <span className={`text-[15px] font-bold ${style.color}`}>{style.label}</span>
                  </div>
                </div>

                <div className="space-y-1">
                   <p className="text-white font-medium text-[14.5px]">
                     عدد المهام في اليوم الواحد: {plan.tasksPerDay}
                   </p>
                   <p className="text-white font-medium text-[14.5px]">
                     فترة الصلاحية : 365
                   </p>
                </div>

                <button 
                  onClick={() => handleJoin(plan)}
                  disabled={!!isCurrent || user?.vipLevel > plan.level}
                  className={`w-full py-3 rounded-full text-[16px] font-bold transition-all ${isCurrent ? 'bg-black/10 text-white cursor-default' : (user?.vipLevel > plan.level) ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#1a56db] text-white hover:bg-blue-800 active:scale-95'}`}
                >
                  {isCurrent ? 'الباقة الحالية' : ((user?.vipLevel > plan.level) ? 'تم الترقية' : 'شراء')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{modalState.title}</h3>
                <p className="text-sm text-gray-600 mb-6">{modalState.message}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                        if (modalState.type === 'confirm' && modalState.onConfirm) {
                            modalState.onConfirm();
                        } else {
                            setModalState({ ...modalState, isOpen: false });
                        }
                    }}
                    className="flex-1 py-2.5 bg-[#1a56db] text-white rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                  >
                    تأكيد
                  </button>
                  {modalState.type === 'confirm' && (
                    <button 
                      onClick={() => setModalState({ ...modalState, isOpen: false })}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-95 transition-all"
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
