import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const Spinner: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export const FullPageSpinner: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-400" role="status">
    <Spinner className="w-9 h-9 text-indigo-400" />
    <p className="text-sm">{label}</p>
  </div>
);

export const Alert: React.FC<{ kind?: 'error' | 'success'; children: React.ReactNode }> = ({ kind = 'error', children }) => {
  const isError = kind === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${
        isError ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      }`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const Field: React.FC<FieldProps> = ({ label, hint, id, type = 'text', ...rest }) => {
  const [show, setShow] = React.useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className="w-full rounded-xl bg-slate-900/70 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

export const SubmitButton: React.FC<{ loading: boolean; children: React.ReactNode; id?: string }> = ({ loading, children, id }) => (
  <button
    id={id}
    type="submit"
    disabled={loading}
    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {loading && <Spinner className="w-4 h-4" />}
    {children}
  </button>
);
