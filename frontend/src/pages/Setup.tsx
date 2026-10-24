import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/AuthShell';
import { Alert, Field, FullPageSpinner, Button } from '../components/ui';

/** Functionality #01: first-run company + Admin creation. Only reachable on an empty install. */
export const Setup: React.FC = () => {
  const { setup, setupComplete, isLoading, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ companyName: '', adminName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoading || setupComplete === null) return <FullPageSpinner label="Verifying system initialization state…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  if (setupComplete) return <Navigate to="/login" replace />;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.companyName.trim()) return setError('Please specify the legal company name.');
    if (!form.email.trim()) return setError('Please specify a corporate admin email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters in length.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    const { confirm: _c, ...payload } = form;
    const res = await setup(payload);
    setLoading(false);
    if (!res.success) setError(res.message || 'Setup encountered an unexpected error');
  };

  return (
    <AuthShell
      title="Initialize Your Organization"
      subtitle="Fresh installation detected. Register your enterprise entity and provision the primary Administrator account."
      footer="Administrator retains full authority over company policies, organizational catalogs, and payroll lock."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert kind="error">{error}</Alert>}

        <Field
          id="companyName"
          label="Enterprise / Company Name"
          placeholder="e.g. Acme Technologies"
          value={form.companyName}
          onChange={set('companyName')}
          required
          autoFocus
        />

        <Field
          id="adminName"
          label="Administrator Full Name"
          placeholder="e.g. Alexander Vance"
          value={form.adminName}
          onChange={set('adminName')}
          required
        />

        <Field
          id="email"
          type="email"
          label="Root Admin Email Address"
          placeholder="admin@acme.com"
          value={form.email}
          onChange={set('email')}
          required
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            id="password"
            type="password"
            label="Master Password"
            hint="Min. 8 characters"
            value={form.password}
            onChange={set('password')}
            required
          />
          <Field
            id="confirm"
            type="password"
            label="Confirm Password"
            value={form.confirm}
            onChange={set('confirm')}
            required
          />
        </div>

        <div className="pt-2">
          <Button
            id="setup-submit"
            type="submit"
            loading={loading}
            icon={ShieldCheck}
            className="w-full"
          >
            Create Company &amp; Sign In
          </Button>
        </div>
      </form>
    </AuthShell>
  );
};
