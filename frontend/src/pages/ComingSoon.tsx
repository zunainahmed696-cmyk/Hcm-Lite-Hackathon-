import React from 'react';
import { useLocation } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS, ROLE_LABEL } from '../config/nav';

/** Temporary screen for modules not built yet. Replaced phase by phase. */
export const ComingSoon: React.FC = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const item = NAV_ITEMS.find((i) => i.path === pathname);
  const Icon = item?.icon ?? Hammer;

  return (
    <div className="max-w-5xl">
      {pathname === '/dashboard' && user && (
        <div className="mb-8">
          <p className="text-sm text-indigo-300 font-semibold">{ROLE_LABEL[user.role]} workspace</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hello, {user.name.split(' ')[0]} 👋</h1>
        </div>
      )}
      {pathname !== '/dashboard' && <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">{item?.label ?? 'Page'}</h1>}

      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
        <span className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </span>
        <h2 className="text-lg font-bold text-white">{item?.label ?? 'This page'} is on its way</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">{item?.description}</p>
        {item && <span className="inline-block mt-4 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">Planned: {item.phase}</span>}
      </div>
    </div>
  );
};
