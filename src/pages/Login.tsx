import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, Smartphone, ShieldCheck, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { databaseService } from '../services/databaseService';

export default function Login() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+964');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    refreshCaptcha();
    const rememberedPhone = localStorage.getItem('zea_remembered_phone');
    const rememberedEmail = localStorage.getItem('zea_remembered_email');
    
    if (rememberedPhone) {
      setLoginMethod('phone');
      setPhone(rememberedPhone.replace(/^\+\d+/, '')); // Simple extraction, ideally parse correctly based on code
      // We could parse the country code from the remembered phone to be accurate
      const matchingCountry = arabCountries.find(c => rememberedPhone.startsWith(c.code));
      if (matchingCountry) {
        setCountryCode(matchingCountry.code);
        setPhone(rememberedPhone.slice(matchingCountry.code.length));
      }
      setRememberMe(true);
    } else if (rememberedEmail) {
      setLoginMethod('email');
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(databaseService.generateCaptcha());
    setInputCaptcha('');
  };

  const handleLogin = async () => {
    if (loginMethod === 'phone' && !phone) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }
    
    if (loginMethod === 'email' && !email) {
      alert('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    if (!password || !inputCaptcha) {
      alert('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    if (inputCaptcha.toUpperCase() !== captcha.toUpperCase()) {
      alert('رمز التحقق غير صحيح');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    const fullPhone = `${countryCode}${phone}`;
    
    // Support admin backdoor for demo
    if (phone === 'admin' && password === 'admin123') {
       navigate('/owner-admin');
       setIsLoading(false);
       return;
    }

    try {
      const loginIdentifier = loginMethod === 'phone' ? fullPhone : email;
      const user = databaseService.login(loginIdentifier);
      
      if (user) {
        if (rememberMe) {
          if (loginMethod === 'phone') {
            localStorage.setItem('zea_remembered_phone', fullPhone);
            localStorage.removeItem('zea_remembered_email');
          } else {
            localStorage.setItem('zea_remembered_email', email);
            localStorage.removeItem('zea_remembered_phone');
          }
        } else {
          localStorage.removeItem('zea_remembered_phone');
          localStorage.removeItem('zea_remembered_email');
        }
        navigate('/home');
      } else {
        alert('بيانات الدخول غير صحيحة');
        refreshCaptcha();
      }
    } catch (error) {
      alert('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const arabCountries = [
    { code: '+964', name: 'العراق' },
    { code: '+966', name: 'السعودية' },
    { code: '+971', name: 'الإمارات' },
    { code: '+20', name: 'مصر' },
    { code: '+962', name: 'الأردن' },
    { code: '+963', name: 'سوريا' },
    { code: '+961', name: 'لبنان' },
    { code: '+970', name: 'فلسطين' },
    { code: '+967', name: 'اليمن' },
    { code: '+968', name: 'عمان' },
    { code: '+965', name: 'الكويت' },
    { code: '+974', name: 'قطر' },
    { code: '+973', name: 'البحرين' },
    { code: '+212', name: 'المغرب' },
    { code: '+213', name: 'الجزائر' },
    { code: '+216', name: 'تونس' },
    { code: '+218', name: 'ليبيا' },
    { code: '+249', name: 'السودان' },
    { code: '+222', name: 'موريتانيا' }
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans text-right pb-20 relative overflow-hidden" dir="rtl">
      {/* Blue curved background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-[#4285F4] to-[#629bf5] rounded-br-[100px] -z-10"></div>
      
      <div className="px-6 pt-12 max-w-sm mx-auto">
        <div className="flex flex-col items-center mb-8 mt-4">
          <h1 className="text-3xl font-black text-white tracking-wide">تسجيل الدخول</h1>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          
          {/* Method Selector */}
          <div className="flex bg-gray-50 p-1 rounded-xl mb-6 border border-gray-100">
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white text-[#4285F4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              تسجيل بالهاتف
            </button>
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white text-[#4285F4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              البريد الإلكتروني
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Input based on method */}
            {loginMethod === 'phone' ? (
              <div className="flex items-center gap-2 border-b border-gray-200 py-3">
                <Smartphone className="text-gray-400" size={20} />
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent focus:outline-none appearance-none font-bold text-xs text-gray-700 w-16"
                  dir="ltr"
                >
                  {arabCountries.map((c) => (
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
            ) : (
              <div className="flex items-center gap-2 border-b border-gray-200 py-3">
                <Mail className="text-gray-400" size={20} />
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="من فضلك أدخل بريدك الإلكتروني"
                  className="w-full bg-transparent focus:outline-none font-bold text-sm text-gray-800 placeholder-gray-400 text-left dir-ltr"
                  dir="rtl"
                />
              </div>
            )}

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
          </div>

          <div className="flex items-center justify-between mt-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div 
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#4285F4] border-[#4285F4]' : 'border-gray-400'}`}
              >
                {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className="text-xs font-bold text-gray-600">تذكر كلمة المرور</span>
            </label>
            <span className="text-xs font-bold text-gray-600 opacity-0">...</span>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-[#4285F4] text-white rounded-xl font-bold text-lg mt-8 shadow-md flex items-center justify-center"
          >
            {isLoading ? 'جاري التحميل...' : 'سجل'}
          </motion.button>

        </div>
        
        <div className="mt-8 text-center bg-white/80 p-4 rounded-xl border border-blue-50 max-w-xs mx-auto shadow-sm">
          <Link to="/signup" className="text-gray-700 font-bold text-sm hover:text-[#4285F4] flex items-center justify-center gap-2">
            ليس لديك حساب؟ إنشاء حساب الآن <span className="text-[#4285F4] font-black">&larr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
