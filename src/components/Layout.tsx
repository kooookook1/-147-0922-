import { Outlet, NavLink } from 'react-router-dom';
import { HomeIcon, TasksIcon, VIPIcon, RecordIcon, ProfileIcon } from './Icons';
import { cn } from '../utils';

export default function Layout() {
  const navItems = [
    { path: '/home', label: 'الرئيسية', icon: HomeIcon },
    { path: '/tasks', label: 'التوظيف', icon: TasksIcon },
    { path: '/vip', label: 'المنصب', icon: VIPIcon },
    { path: '/record', label: 'السجل', icon: RecordIcon },
    { path: '/profile', label: 'المركز الشخصي', icon: ProfileIcon },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f5f7fa] font-sans text-right" dir="rtl">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-[65px] px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-end w-full h-full pb-1.5 transition-colors',
                isActive ? 'text-[#3b71e8]' : 'text-[#a3a3a3]'
              )
            }
          >
            <div className={cn("flex items-center justify-center flex-1", item.path === '/vip' ? "mb-0.5" : "mb-1")}>
              <item.icon className={cn("w-7 h-7", item.path === '/vip' && "w-[46px] h-[46px]")} />
            </div>
            <span className="text-[11px] font-medium leading-none">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
