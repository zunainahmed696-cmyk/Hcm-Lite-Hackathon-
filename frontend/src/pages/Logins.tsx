import React, { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound, Plus, UserCheck, UserX, X } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { Alert, Field, Spinner, SubmitButton } from '../components/ui';
import { ROLE_LABEL } from '../config/nav';
import { User } from '../types';

interface Credentials { name: string; email: string; tempPassword: string }

/** Admin: create HR logins, deactivate/reactivate, reset passwords (functionality #05). */
export const Logins: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [creds, setCreds] = useState<Credentials | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/org/users');
      setUsers(res.data.users);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showCreds = (c: Credentials) => { setCreds(c); setCopied(false); };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const res = await api.post('/org/users/hr', form);
      showCreds({ name: res.data.user.name, email: res.data.user.email, tempPassword: res.data.tempPassword });
      setForm({ name: '', email: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: User) => {
    setError('');
    try {
      await api.patch(`/org/users/${u.id}/status`, { isActive: !u.isActive });
      await load();
    } catch (err) { setError(errorMessage(err)); }
  };

  const reset = async (u: User) => {
    if (!window.confirm(`Reset the password for ${u.name}? They must change it on next sign-in.`)) return;
    setError('');
    try {
      const res = await api.post(`/org/users/${u.id}/reset-password`);
      showCreds({ name: u.name, email: u.email, tempPassword: res.data.tempPassword });
    } catch (err) { setError(errorMessage(err)); }
  };

  const copy = async () => {
    if (!creds) return;
    await navigator.clipboard.writeText(`Email: ${creds.email}\nTemporary password: ${creds.tempPassword}`);
    setCopied(true);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Logins</h1>
          <p className="mt-1 text-sm text-slate-400">Create HR accounts and manage access. Employee logins are created by HR when registering employees.</p>
        </div>
        <button onClick={() => { setShowForm(true); setFormError(''); }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
          <Plus className="w-4 h-4" /> New HR login
        </button>
      </div>

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      {creds && (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">Temporary password for {creds.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Shown only once. Share it securely; they must change it on first sign-in.</p>
            </div>
            <button onClick={() => setCreds(null)} aria-label="Dismiss" className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-emerald-300">{creds.email}</code>
            <code className="rounded-lg bg-slate-950 px-3 py-2 text-sm text-emerald-300 tracking-wider">{creds.tempPassword}</code>
            <button onClick={copy} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={create} className="mb-6 rounded-2xl border border-indigo-400/30 bg-slate-900/70 p-5 space-y-4" noValidate>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">New HR login</h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          {formError && <Alert>{formError}</Alert>}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="hr-name" label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            <Field id="hr-email" type="email" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="max-w-xs"><SubmitButton id="hr-create" loading={saving}>Create login</SubmitButton></div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400"><Spinner className="inline w-5 h-5 mr-2" />Loading…</td></tr>
            ) : (
              users.map((u) => {
                const locked = u.role === 'admin';
                return (
                  <tr key={u.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-300">{u.email}</td>
                    <td className="px-4 py-3 text-slate-300">{ROLE_LABEL[u.role]}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/60 text-slate-400'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                      {u.mustChangePassword && <span className="ml-2 text-xs text-amber-300">temp password</span>}
                    </td>
                    <td className="px-4 py-3">
                      {!locked && (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => reset(u)} title="Reset password" aria-label="Reset password" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60"><KeyRound className="w-4 h-4" /></button>
                          <button onClick={() => toggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'} aria-label={u.isActive ? 'Deactivate' : 'Activate'} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60">
                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
