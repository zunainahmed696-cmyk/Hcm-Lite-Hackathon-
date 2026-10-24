import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/AuthShell';
import { Alert, Field, FullPageSpinner, SubmitButton } from '../components/ui';

/** Functionality #01: first-run company + Admin creation. Only reachable on an empty install. */
export const Setup: React.FC = () => {
  const { setup, setupComplete, isLoading, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ companyName: '', adminName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoading || setupComplete === null) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  if (setupComplete) return <Navigate to="/login" replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setLoading(true);
    const { confirm: _c, ...payload } = form;
    const res = await setup(payload);
    setLoading(false);
    if (!res.success) setError(res.message || 'Setup failed');
  };

  return (
    <AuthShell title="Set up your company" subtitle="Welcome! Create the company profile and the Admin account to get started.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field id="companyName" label="Company name" placeholder="Acme Pvt Ltd" value={form.companyName} onChange={set('companyName')} required autoFocus />
        <Field id="adminName" label="Admin name" placeholder="Your full name" value={form.adminName} onChange={set('adminName')} required />
        <Field id="email" type="email" label="Admin email" placeholder="admin@company.com" value={form.email} onChange={set('email')} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field id="password" type="password" label="Password" hint="Min. 8 characters" value={form.password} onChange={set('password')} required />
          <Field id="confirm" type="password" label="Confirm" value={form.confirm} onChange={set('confirm')} required />
        </div>
        <SubmitButton id="setup-submit" loading={loading}>Create company &amp; sign in</SubmitButton>
      </form>
    </AuthShell>
  );
};
