import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navForRole, ROLE_LABEL } from '../config/nav';

export const AppLayout: React.FC = () => {
  const { user, companyName, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const items = navForRole(user.role);
  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebar = (
    <nav aria-label="Main menu" className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800/80">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-white" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white leading-tight">HCM Lite</p>
          <p className="text-[11px] text-slate-400 truncate">{companyName ?? 'Your company'}</p>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white ring-1 ring-indigo-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-3">
          <span className="w-9 h-9 shrink-0 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400">{ROLE_LABEL[user.role]}</p>
          </div>
          <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden lg:block sticky top-0 h-screen bg-slate-950 border-r border-slate-800/80">{sidebar}</aside>

      {/* Mobile top bar + drawer */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-slate-950/90 backdrop-blur border-b border-slate-800/80">
        <span className="font-extrabold text-white">HCM Lite</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 text-slate-300"><Menu className="w-5 h-5" /></button>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-slate-950 border-r border-slate-800 relative">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute top-4 right-3 p-1 text-slate-400"><X className="w-5 h-5" /></button>
            {sidebar}
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}

      <main className="min-w-0 p-5 sm:p-8 bg-gradient-to-b from-slate-950 to-slate-900/60">
        <Outlet />
      </main>
    </div>
  );
};
