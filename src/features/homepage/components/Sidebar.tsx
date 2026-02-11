import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Building2, 
  Users, 
  Settings, 
  PieChart, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import type { User } from '../../../types'; 

interface SidebarProps {
  user: User;
  onLogout: () => void;
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: CalendarDays, label: 'Schedule', active: false },
    { icon: Building2, label: 'Rooms & Labs', active: false },
    { icon: Users, label: 'Team', active: false },
    { icon: PieChart, label: 'Analytics', active: false },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', active: false },
    { icon: HelpCircle, label: 'Support', active: false },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 border-r border-gray-800 shadow-xl z-20">
      <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-950">
        <div className="h-8 w-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-brand-500/20">
          <span className="font-bold text-white text-lg">B</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white">BoLab</span>
      </div>

      <div className="flex-1 flex flex-col py-6 px-3 space-y-1 custom-scrollbar overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
              ${item.active 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${item.active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span>{item.label}</span>
            </div>
            {item.active && <ChevronRight className="h-4 w-4 text-brand-300" />}
          </button>
        ))}

        <div className="mt-8 px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          System
        </div>
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-900 transition-colors cursor-pointer group">
          <img 
             src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
             alt={user.name}
             className="h-10 w-10 rounded-full border-2 border-gray-700 group-hover:border-brand-500 transition-colors"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button onClick={onLogout} className="text-gray-500 hover:text-red-400 transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export { Sidebar };
export default Sidebar;