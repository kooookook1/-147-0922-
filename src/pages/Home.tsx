import { Mail, Play, Send } from 'lucide-react';
import { CustomerServiceIcon, DocumentIcon, VideoPlayIcon } from '../components/Icons';

export default function Home() {
  const members = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    phone: `****${Math.floor(1000 + Math.random() * 9000)}`,
    amount: (Math.random() * 50 + 10).toFixed(2),
  }));

  return (
    <div className="pb-20 bg-white min-h-screen">
      {/* Header Image Area */}
      <div className="relative w-full h-56 bg-gray-200">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800&h=600" 
          alt="Header" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 w-24">
          <img src="https://storage.googleapis.com/aistudio-user-content-prod/071c8905-2d7c-4876-8f24-9b22e176378e/4.png" alt="ACCE Logo" className="w-full h-auto object-contain" />
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
            <Mail className="w-5 h-5 text-[#3b71e8]" />
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src="https://flagcdn.com/ae.svg" alt="UAE Flag" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* 3 Blue Buttons */}
      <div className="flex bg-[#3b71e8] text-white rounded-b-xl overflow-hidden shadow-sm">
        <div className="flex-1 py-3 flex flex-col items-center justify-center">
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <VideoPlayIcon className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">فيديو تعليمي</span>
        </div>
        <div className="flex-1 py-3 flex flex-col items-center justify-center">
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <DocumentIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">منع الاحتيال</span>
        </div>
        <div className="flex-1 py-3 flex flex-col items-center justify-center">
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <CustomerServiceIcon className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">مركز المساعدة</span>
        </div>
      </div>

      {/* Video Section */}
      <div className="flex p-2 gap-2 mt-2 relative">
        <div className="flex-1 bg-black h-48 rounded-sm"></div>
        <div className="w-16 flex flex-col gap-2">
          <div className="bg-black text-white h-[4.5rem] rounded-sm flex items-center justify-center">
            <Play className="w-8 h-8" fill="white" />
          </div>
          <div className="bg-black text-white h-[4.5rem] rounded-sm flex items-center justify-center">
            <Play className="w-8 h-8" fill="white" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center pt-1">
            <div className="w-10 h-10 bg-[#3b71e8] rounded-full flex items-center justify-center mb-1 text-white">
              <VideoPlayIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-center leading-tight font-medium text-gray-800">المزيد من<br/>الفيديوهات</span>
          </div>
        </div>
        
        {/* Floating Telegram Button */}
        <div className="absolute bottom-6 right-8 w-14 h-14 bg-[#3b71e8] rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white z-20">
            <Send className="w-6 h-6 -ml-1 mt-1" fill="white" />
        </div>
      </div>

      {/* Employee Section */}
      <div className="mt-2">
        <div className="bg-[#3b71e8] text-white text-center py-2 font-medium text-sm">
          موظف
        </div>
        <div className="bg-white p-2 flex gap-2 overflow-x-auto border-b border-gray-100">
          {members.slice(0, 5).map((member, index) => (
            <div key={index} className="bg-white p-2 rounded shadow-sm min-w-[140px] flex items-center gap-2 border border-gray-100">
              <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
                <img src={`https://storage.googleapis.com/aistudio-user-content-prod/071c8905-2d7c-4876-8f24-9b22e176378e/${(member.id % 3) + 1}.png`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600">{member.phone}</span>
                <span className="text-sm font-bold text-[#3b71e8]">${member.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Gift Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="w-14 h-14 bg-pink-500 rounded-full shadow-lg flex items-center justify-center text-white">
          <span className="text-3xl">🎁</span>
        </div>
      </div>
    </div>
  );
}
