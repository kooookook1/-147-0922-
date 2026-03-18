import { useState } from 'react';
import { ChevronLeft, Youtube, Play, Facebook, Instagram } from 'lucide-react';

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('youtube');

  const tabs = [
    { id: 'youtube', label: 'Youtube', icon: Youtube, color: 'text-red-500' },
    { id: 'tiktok', label: 'Tiktok', icon: Play, color: 'text-black' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  ];

  return (
    <div className="bg-[#f5f7fa] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white text-gray-800 p-4 text-center text-lg font-bold relative shadow-sm">
        قاعة المهمة
        <ChevronLeft className="absolute right-4 top-4 w-6 h-6 text-gray-500" />
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`flex-1 py-3.5 text-sm font-medium flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-gray-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="p-3 space-y-3">
        {[0, 1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 flex gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                {activeTab === 'youtube' && <Youtube className="w-8 h-8 text-red-500" />}
                {activeTab === 'tiktok' && <Play className="w-8 h-8 text-black" />}
                {activeTab === 'facebook' && <Facebook className="w-8 h-8 text-blue-600" />}
                {activeTab === 'instagram' && <Instagram className="w-8 h-8 text-pink-600" />}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-gray-800 text-sm mb-1">متطلبات المهمة: VIP{level}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>المكافأة:</span>
                  <span className="font-bold text-orange-500 text-sm">${(0.5 * (level + 1)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">الكمية المتبقية: {100 - level * 10}</span>
              <button className="bg-blue-500 hover:bg-blue-600 transition text-white px-6 py-1.5 rounded-full text-sm font-medium shadow-sm">
                استلام
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
