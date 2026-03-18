import { ChevronLeft, CreditCard, Wallet, Smile, Landmark, FileText, Store, Gift } from 'lucide-react';

export default function Profile() {
  return (
    <div className="bg-[#f5f7fa] min-h-screen pb-24 font-sans text-right" dir="rtl">
      {/* Header */}
      <div className="bg-[#5584ff] text-white pt-8 pb-20 px-4 relative flex flex-col items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 bg-gray-200">
            <img src="https://storage.googleapis.com/aistudio-user-content-prod/071c8905-2d7c-4876-8f24-9b22e176378e/1.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-medium">****89723</span>
            <span className="text-[#d8b4fe] font-bold italic text-[17px]">C 1</span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mx-4 -mt-12 relative z-10 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5 mb-4 border border-gray-50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-40 pointer-events-none" style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, transparent 40%, transparent 60%, #f0f4ff 100%)'
        }}></div>
        
        <div className="relative z-10">
          <div className="flex items-end justify-between mb-8">
            <div className="flex flex-col">
              <span className="text-[#5584ff] font-medium text-[15px] mb-1">الارباح</span>
              <span className="text-[42px] font-bold text-[#2563eb] leading-none">80.5</span>
            </div>
            <div className="flex-1 mr-6 flex flex-col items-end justify-end pb-1.5">
              <span className="text-xl font-bold text-gray-700 mb-1">110</span>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#3b71e8] w-[73%] rounded-full relative overflow-hidden" style={{
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, white 8px, white 12px)'
                }}></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-center mt-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-gray-800 text-[12px] mb-1">مكافأة الإحالة الداخلية</span>
                <span className="text-[#2563eb] font-bold text-[19px]">72</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 text-[12px] mb-1">إجمالي دخل المهمة</span>
                <span className="text-[#2563eb] font-bold text-[19px]">352</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 text-[12px] mb-1">دخل مهمة اليوم</span>
                <span className="text-[#2563eb] font-bold text-[19px]">16</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-gray-800 text-[12px] mb-1">إجمالي الإيرادات</span>
                <span className="text-[#2563eb] font-bold text-[19px]">424</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-800 text-[12px] mb-1">يوم العمل الفعال</span>
                <span className="text-[#2563eb] font-bold text-[19px]">343</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white mx-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden mb-6">
        {[
          { icon: CreditCard, label: 'شحن الحساب', color: '#eab308', fill: '#fef08a' },
          { icon: Wallet, label: 'سحب', color: '#22c55e', fill: '#bbf7d0' },
          { icon: Smile, label: 'توظيف الموظفين', color: '#10b981', fill: '#a7f3d0' },
          { icon: Landmark, label: 'عنوان المحفظة', color: '#a855f7', fill: '#e9d5ff' },
          { icon: FileText, label: 'سجل الايداع', color: '#3b82f6', fill: '#bfdbfe' },
          { icon: FileText, label: 'سجل السحب', color: '#3b82f6', fill: '#bfdbfe' },
          { icon: Store, label: 'المختار ACCE متجر', color: '#f97316', fill: '#fed7aa' },
          { icon: Gift, label: 'سجل الفوز', color: '#ef4444', fill: '#fecaca' },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 active:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center">
                <item.icon className="w-full h-full" color={item.color} fill={item.fill} strokeWidth={1.5} />
              </div>
              <span className="text-[#333333] font-medium text-[15px]">{item.label}</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-[#5584ff]" />
          </div>
        ))}
      </div>
    </div>
  );
}
