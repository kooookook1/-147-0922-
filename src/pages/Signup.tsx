import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Lock, Eye, EyeOff, ShieldCheck, Smartphone, Tag, TrendingUp, Activity, ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { databaseService } from '../services/databaseService';
import { countryCodes } from '../utils/countries';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+964');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    refreshCaptcha();
    
    // Auto-fill invitation code from URL
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setInvitationCode(refCode);
    }
  }, [location.search]);

  const refreshCaptcha = () => {
    setCaptcha(databaseService.generateCaptcha());
    setInputCaptcha('');
  };

  const handleSignup = async () => {
    if (!agreed) {
      toast.error('مطلوب الموافقة على الخصوصية والاتفاقية');
      return;
    }
    
    if (!phone) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }

    if (!name || !password || !inputCaptcha || !invitationCode) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }

    if (inputCaptcha.toUpperCase() !== captcha.toUpperCase()) {
      toast.error('رمز التحقق غير صحيح');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${phone}`;
      
      databaseService.signup({ 
        name, 
        email: `${fullPhone}@zea.com`, 
        phoneNumber: fullPhone,
        invitationCode
      });

      setTimeout(() => {
        navigate('/home');
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الحساب');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] font-sans text-right relative overflow-hidden flex items-center justify-center selection:bg-blue-500/30" dir="rtl">
      
      {/* Animated Trading Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0e17] to-[#0a0e17]"></div>
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6bTAgMHY0MGgxVjB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+Cjwvc3ZnPg==')] opacity-50 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"></div>
        
        {/* Glowing Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[10%] -left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px]"
        />
      </div>

      <div className="w-full max-w-[420px] px-6 z-10 relative pt-10 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
            <TrendingUp size={32} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-wide mb-2">إنشاء حساب جديد</h1>
          <p className="text-teal-100/60 text-sm font-medium">ابدأ رحلة التداول الخاصة بك اليوم</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#131b2c]/80 backdrop-blur-xl rounded-[28px] p-8 shadow-2xl border border-white/5 relative overflow-hidden"
        >
          {/* Subtle top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

          <div className="space-y-4">
            
            {/* Phone Input */}
            <div>
              <div className={`flex items-center gap-3 bg-[#0a0e17] rounded-xl px-4 py-3 border transition-colors duration-300 ${focusedInput === 'phone' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/5'}`}>
                <Smartphone className={`${focusedInput === 'phone' ? 'text-emerald-500' : 'text-gray-500'} transition-colors duration-300`} size={20} />
                <div className="h-5 w-[1px] bg-white/10 mx-1"></div>
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                  className="bg-transparent focus:outline-none appearance-none font-bold text-sm text-gray-300 w-16 cursor-pointer"
                  dir="ltr"
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#131b2c]">{c.code}</option>
                  ))}
                </select>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="رقم هاتفك المحمول"
                  className="w-full bg-transparent focus:outline-none font-bold text-sm text-white placeholder-gray-600"
                />
              </div>
            </div>

            {/* Captcha */}
            <div>
              <div className={`flex items-center gap-3 bg-[#0a0e17] rounded-xl px-4 py-3 border transition-colors duration-300 ${focusedInput === 'captcha' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/5'}`}>
                <ShieldCheck className={`${focusedInput === 'captcha' ? 'text-emerald-500' : 'text-gray-500'} transition-colors duration-300`} size={20} />
                <div className="h-5 w-[1px] bg-white/10 mx-1"></div>
                <input 
                  type="text" 
                  value={inputCaptcha}
                  onChange={(e) => setInputCaptcha(e.target.value)}
                  onFocus={() => setFocusedInput('captcha')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="رمز التحقق الأمن"
                  className="w-full bg-transparent focus:outline-none font-bold text-sm text-white placeholder-gray-600 uppercase"
                />
                <div 
                  onClick={refreshCaptcha}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors rounded-lg px-3 py-1.5 flex items-center justify-center cursor-pointer border border-emerald-500/20 flex-shrink-0"
                >
                  <span className="font-mono font-bold text-emerald-400 tracking-widest select-none text-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{captcha}</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className={`flex items-center gap-3 bg-[#0a0e17] rounded-xl px-4 py-3 border transition-colors duration-300 relative ${focusedInput === 'password' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/5'}`}>
                <Lock className={`${focusedInput === 'password' ? 'text-emerald-500' : 'text-gray-500'} transition-colors duration-300`} size={20} />
                <div className="h-5 w-[1px] bg-white/10 mx-1"></div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="كلمة المرور المشفرة"
                  className="w-full bg-transparent focus:outline-none font-bold text-sm text-white placeholder-gray-600"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className={`flex items-center gap-3 bg-[#0a0e17] rounded-xl px-4 py-3 border transition-colors duration-300 relative ${focusedInput === 'confirmPassword' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/5'}`}>
                <Lock className={`${focusedInput === 'confirmPassword' ? 'text-emerald-500' : 'text-gray-500'} transition-colors duration-300`} size={20} />
                <div className="h-5 w-[1px] bg-white/10 mx-1"></div>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="تأكيد كلمة المرور"
                  className="w-full bg-transparent focus:outline-none font-bold text-sm text-white placeholder-gray-600"
                />
                <button 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <div className={`flex items-center gap-3 bg-[#0a0e17] rounded-xl px-4 py-3 border transition-colors duration-300 ${focusedInput === 'name' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/5'}`}>
                <UserIcon className={`${focusedInput === 'name' ? 'text-emerald-500' : 'text-gray-500'} transition-colors duration-300`} size={20} />
                <div className="h-5 w-[1px] bg-white/10 mx-1"></div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="اسم المستخدم المستعار"
                  className="w-full bg-transparent focus:outline-none font-bold text-sm text-white placeholder-gray-600"
                />
              </div>
            </div>

            {/* Invite Code */}
            <div>
              <div className={`flex items-center gap-3 bg-[#0a0e17] rounded-xl px-4 py-3 border transition-colors duration-300 ${focusedInput === 'invitationCode' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-white/5'}`}>
                <Tag className={`${focusedInput === 'invitationCode' ? 'text-emerald-500' : 'text-gray-500'} transition-colors duration-300`} size={20} />
                <div className="h-5 w-[1px] bg-white/10 mx-1"></div>
                <input 
                  type="text" 
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  onFocus={() => setFocusedInput('invitationCode')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="رمز الدعوة (إلزامي)"
                  className="w-full bg-transparent focus:outline-none font-bold text-sm text-white placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center mt-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                />
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${agreed ? 'bg-emerald-600 border-emerald-600' : 'bg-[#0a0e17] border-gray-600 group-hover:border-emerald-400'}`}>
                  <AnimatePresence>
                    {agreed && (
                      <motion.svg 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-3.5 h-3.5 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <span className="text-[12px] font-bold text-gray-400 group-hover:text-gray-300 transition-colors">لقد قرات وأوافق على <span className="text-emerald-400 hover:text-emerald-300 transition-colors">اتفاقية التسجيل والشروط</span></span>
            </label>
          </div>

          <motion.button 
            whileHover={agreed ? { scale: 1.02 } : {}}
            whileTap={agreed ? { scale: 0.98 } : {}}
            onClick={handleSignup}
            disabled={isLoading || !agreed}
            className={`w-full h-14 rounded-xl font-bold text-lg mt-8 flex items-center justify-center relative overflow-hidden group transition-all duration-300 ${
              agreed 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
            }`}
          >
            {agreed && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>}
            
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري إنشاء المحفظة...</span>
              </div>
            ) : (
               <span className="flex items-center gap-2">
                 تسجيل حساب جديد
                 <Activity size={20} className={agreed ? 'opacity-80' : 'opacity-50'} />
               </span>
            )}
          </motion.button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Link to="/login" className="inline-flex text-gray-400 font-bold text-sm hover:text-emerald-400 group transition-colors px-6 py-3 bg-[#131b2c]/50 rounded-full border border-white/5 backdrop-blur-sm">
            لديك حساب بالفعل؟ <span className="text-white mr-2 group-hover:text-emerald-400 transition-colors flex items-center gap-1">سجل الدخول <ChevronLeft size={16} /></span>
          </Link>
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

