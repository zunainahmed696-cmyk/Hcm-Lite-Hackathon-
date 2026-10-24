import React from 'react';
import { Briefcase } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Split-screen layout shared by Setup, Login and Change Password. */
export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen grid lg:grid-cols-2">
    <aside className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="relative flex items-center gap-3 text-white">
        <span className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
          <Briefcase className="w-5 h-5" />
        </span>
        <span className="text-xl font-extrabold tracking-tight">HCM Lite</span>
      </div>
      <div className="relative text-white">
        <h2 className="text-4xl font-extrabold leading-tight">People operations,<br />answered by your data.</h2>
        <p className="mt-4 max-w-md text-indigo-100/90 text-sm leading-relaxed">
          Employees, attendance, leave and payroll in one place, with an AI assistant that only ever answers from real records and your own access level.
        </p>
        <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-xs font-semibold">
          {['Admin', 'HR', 'Employee'].map((r) => (
            <li key={r} className="rounded-xl bg-white/10 backdrop-blur px-3 py-2.5">{r}</li>
          ))}
        </ul>
      </div>
      <p className="relative text-xs text-indigo-100/70">Saylani Hackathon · 24 October 2026</p>
    </aside>

    <main className="flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="lg:hidden flex items-center gap-2 mb-8 text-white font-extrabold text-lg">
          <Briefcase className="w-5 h-5 text-indigo-400" /> HCM Lite
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
        <p className="mt-2 mb-8 text-sm text-slate-400">{subtitle}</p>
        {children}
        {footer && <div className="mt-6 text-center text-xs text-slate-500">{footer}</div>}
      </div>
    </main>
  </div>
);
