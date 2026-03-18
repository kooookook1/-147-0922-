export default function VIP() {
  const plans = [
    {
      price: '600 USDT',
      level: 'C 1',
      tasks: 5,
      days: 365,
      char1Color: 'text-[#9b6bb0]',
      char2Color: 'text-[#9b6bb0]',
      buttonColor: 'bg-[#73a0f1]',
    },
    {
      price: '1200 USDT',
      level: 'C 2',
      tasks: 10,
      days: 365,
      char1Color: 'text-[#b5c034]',
      char2Color: 'text-[#b5c034]',
      buttonColor: 'bg-[#1a56b6]',
    },
    {
      price: '2600 USDT',
      level: 'B 1',
      tasks: 11,
      days: 365,
      char1Color: 'text-[#b06b6b]',
      char2Color: 'text-[#b06b6b]',
      buttonColor: 'bg-[#1a56b6]',
    },
    {
      price: '6000 USDT',
      level: 'B 2',
      tasks: 25,
      days: 365,
      char1Color: 'text-[#b5a642]',
      char2Color: 'text-[#e67e22]',
      buttonColor: 'bg-[#1a56b6]',
    },
    {
      price: '13000 USDT',
      level: 'A 1',
      tasks: 33,
      days: 365,
      char1Color: 'text-[#8bc34a]',
      char2Color: 'text-[#f39c12]',
      buttonColor: 'bg-[#1a56b6]',
    },
    {
      price: '28000 USDT',
      level: 'A 2',
      tasks: 71,
      days: 365,
      char1Color: 'text-[#8d6e63]',
      char2Color: 'text-[#8bc34a]',
      buttonColor: 'bg-[#1a56b6]',
    },
    {
      price: '60000 USDT',
      level: 'S 1',
      tasks: 0,
      days: 365,
      char1Color: 'text-[#ab47bc]',
      char2Color: 'text-[#f48fb1]',
      buttonColor: 'bg-[#1a56b6]',
    },
    {
      price: '100000 USDT',
      level: 'S 2',
      tasks: 3,
      days: 365,
      char1Color: 'text-[#7e57c2]',
      char2Color: 'text-[#f48fb1]',
      buttonColor: 'bg-[#1a56b6]',
    }
  ];

  return (
    <div className="bg-[#eef5ff] min-h-screen pb-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[40%] bg-white/60 rotate-[-15deg] transform origin-top-left"></div>
        <div className="absolute bottom-[10%] right-[-20%] w-[140%] h-[40%] bg-gradient-to-tr from-[#dbeafe] to-transparent rotate-[-15deg] transform origin-bottom-right"></div>
      </div>

      {/* Header */}
      <div className="bg-[#3b71e8] text-white h-14 px-4 flex justify-between items-center relative z-10">
        <div className="w-16"></div> {/* Spacer to keep title centered */}
        <h1 className="text-lg font-bold">شراء</h1>
        <button className="px-4 py-1 border border-white rounded-lg text-sm font-medium hover:bg-white/10 transition">
          سجل
        </button>
      </div>

      {/* Cards */}
      <div className="p-4 space-y-4 relative z-10">
        {plans.map((plan, index) => {
          const [char1, char2] = plan.level.split(' ');
          return (
            <div key={index} className="bg-gradient-to-br from-[#8cb8f9] via-[#b5d5fc] to-[#8cb8f9] rounded-xl p-4 shadow-sm border border-white/40 relative overflow-hidden">
              {/* Card Geometric Pattern */}
              <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] right-[10%] w-[40%] h-[150%] bg-white/10 rotate-45"></div>
                <div className="absolute bottom-[-20%] left-[10%] w-[40%] h-[150%] bg-white/10 rotate-45"></div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h2 className="text-[22px] font-bold text-[#1e40af] tracking-wide mb-1">{plan.price}</h2>
                    <div className="text-white text-[13px] space-y-0.5 font-medium">
                      <p>عدد المهام في اليوم الواحد: {plan.tasks}</p>
                      <p>فترة الصلاحية : {plan.days}</p>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm min-w-[3.5rem] text-center flex justify-center items-center space-x-1 space-x-reverse">
                    <span className={`text-xl font-black ${plan.char1Color}`}>{char1}</span>
                    <span className={`text-xl font-black ${plan.char2Color}`}>{char2}</span>
                  </div>
                </div>

                <button className={`w-full mt-3 py-2.5 rounded-full text-white font-bold text-base shadow-sm hover:opacity-90 transition ${plan.buttonColor}`}>
                  شراء
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
