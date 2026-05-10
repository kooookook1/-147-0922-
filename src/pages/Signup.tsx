import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { User as UserIcon, Lock, Eye, EyeOff, ShieldCheck, Smartphone, Tag } from 'lucide-react';
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
      alert('الرجاء إدخال رقم الهاتف');
      return;
    }

    if (!name || !password || !inputCaptcha || !invitationCode) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }

    if (inputCaptcha.toUpperCase() !== captcha.toUpperCase()) {
      alert('رمز التحقق غير صحيح');
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

      navigate('/home');
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans text-right pb-20 relative overflow-hidden" dir="rtl">
      {/* Blue curved background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-[#4285F4] to-[#629bf5] rounded-br-[100px] -z-10"></div>
      
      <div className="px-6 pt-12 max-w-sm mx-auto">
        <div className="flex flex-col items-center mb-8 mt-4">
          <h1 className="text-3xl font-black text-white tracking-wide">تسجيل حساب</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">

          <div className="space-y-4">
            
            <div className="flex items-center gap-2 border-b border-gray-200 py-3">
              <Smartphone className="text-gray-400" size={20} />
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <select 
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent focus:outline-none appearance-none font-bold text-xs text-gray-700 w-16"
                dir="ltr"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="من فضلك أدخل رقم هاتفك"
                className="w-full bg-transparent focus:outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Captcha */}
            <div className="flex items-center gap-2 border-b border-gray-200 py-3">
              <ShieldCheck className="text-gray-400" size={20} />
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <input 
                type="text" 
                value={inputCaptcha}
                onChange={(e) => setInputCaptcha(e.target.value)}
                placeholder="الرجاء إدخال الكابتشا الرسومية"
                className="w-full bg-transparent focus:outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
              />
              <div 
                onClick={refreshCaptcha}
                className="bg-gray-100 rounded px-3 py-1 flex items-center justify-center cursor-pointer border border-gray-200 flex-shrink-0"
              >
                <span className="font-black text-blue-600 tracking-wider italic select-none text-sm">{captcha}</span>
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center gap-2 border-b border-gray-200 py-3 relative">
              <Lock className="text-gray-400" size={20} />
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="الرجاء ادخال كلمة المرور"
                className="w-full bg-transparent focus:outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="flex items-center gap-2 border-b border-gray-200 py-3 relative">
              <Lock className="text-gray-400" size={20} />
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="الرجاء تأكيد كلمة المرور"
                className="w-full bg-transparent focus:outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
              />
              <button 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Name */}
            <div className="flex items-center gap-2 border-b border-gray-200 py-3">
              <UserIcon className="text-gray-400" size={20} />
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الرجاء إدخال اسم المستخدم"
                className="w-full bg-transparent focus:outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Invite Code */}
            <div className="flex items-center gap-2 border-b border-gray-200 py-3">
              <Tag className="text-gray-400" size={20} />
              <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
              <input 
                type="text" 
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="الرجاء إدخال رمز الدعوة"
                className="w-full bg-transparent focus:outline-none font-bold text-sm text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center mt-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div 
                onClick={() => setAgreed(!agreed)}
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${agreed ? 'bg-[#4285F4] border-[#4285F4]' : 'border-gray-400'}`}
              >
                {agreed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className="text-[11px] font-bold text-gray-600">لقد قرات وأوافق <span className="text-[#4285F4]">اتفاقية التسجيل</span></span>
            </label>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleSignup}
            disabled={isLoading || !agreed}
            className={`w-full py-4 rounded-xl font-bold text-lg mt-8 shadow-md flex items-center justify-center transition-colors ${agreed ? 'bg-[#4285F4] text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'}`}
          >
            {isLoading ? 'جاري التحميل...' : 'تسجيل فوري'}
          </motion.button>

        </div>
        
        <div className="mt-8 text-center bg-white/80 p-4 rounded-xl border border-blue-50 max-w-xs mx-auto shadow-sm">
          <Link to="/login" className="text-gray-700 font-bold text-sm hover:text-[#4285F4] flex items-center justify-center gap-2">
            لديك حساب بالفعل؟ سجل الدخول الآن <span className="text-[#4285F4] font-black">&larr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
