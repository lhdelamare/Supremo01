import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wallet, 
  ShoppingBag, 
  Settings, 
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Building2, label: 'Capítulos', path: '/capitulos' },
  { icon: Users, label: 'Irmãos', path: '/irmaos' },
  { icon: Wallet, label: 'Financeiro', path: '/financeiro' },
  { icon: ShoppingBag, label: 'Vendas & Loja', path: '/loja' },
  { icon: Users, label: 'Usuários', path: '/usuarios', roles: ['admin'] },
  { icon: ShieldCheck, label: 'Administração', path: '/admin', roles: ['admin'] },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

export function Sidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    if (user?.email === 'delamare@gmail.com') return true; // Fallback for main admin
    return user && item.roles.includes(user.role);
  });

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-outline-variant bg-surface-container-lowest transition-transform">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <span className="text-xl font-serif font-bold">S</span>
          </div>
          <div className="ml-3">
            <h1 className="text-sm font-serif font-bold leading-tight text-primary">SGCARSP</h1>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Arco Real SP</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-surface-container-low',
                  isActive 
                    ? 'bg-primary/5 text-primary soft-gold-bar' 
                    : 'text-on-surface-variant'
                )
              }
            >
              <item.icon className={cn('mr-3 h-5 w-5 transition-colors')} />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair do Sistema
          </button>
        </div>
      </div>
    </aside>
  );
}
