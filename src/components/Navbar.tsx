import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, User as UserIcon, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-border-gray flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <img 
          src="https://jobs.iebc.or.ke/logo.png" 
          alt="IEBC Logo" 
          className="h-10 w-10 object-contain"
          referrerPolicy="no-referrer"
        />
        <h2 className="text-lg font-semibold text-dark">
          National Job Recruitment Portal
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-border-gray">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-dark leading-none">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
          </div>
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
