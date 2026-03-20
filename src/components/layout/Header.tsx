import React from 'react';
import { Bell, Search, User as UserIcon, Menu } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="glass-topbar sticky top-0 z-30 flex h-16 w-full items-center border-b border-outline-variant px-4 lg:px-8">
      <div className="flex flex-1 items-center">
        <button 
          onClick={onMenuClick}
          className="mr-4 rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative hidden w-96 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input 
            placeholder="Pesquisar no sistema..." 
            className="pl-10 bg-surface-container-low border-transparent focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-sm font-semibold text-on-surface">
                {user?.display_name || 'Usuário'}
              </p>
            </div>
            <p className="text-xs text-on-surface-variant capitalize">
              {user?.role || 'Consulta'}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-white overflow-hidden">
            {user?.photo_url ? (
              <img src={user.photo_url} alt={user.display_name} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-6 w-6" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
