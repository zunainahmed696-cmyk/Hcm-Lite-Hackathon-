import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/AuthShell';
import { Alert, Field, FullPageSpinner, SubmitButton } from '../components/ui';

export const ChangePassword: React.FC = () => {
  const { user, isLoading, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  const forced = user.mustChangePassword;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.next.length < 8) return setError('New password must be at least 8 characters.');
    if (form.next !== form.confirm) return setError('New passwords do not match.');
    setLoading(true);
    const res = await changePassword(form.current, form.next);
    setLoading(false);
    if (res.success) navigate('/dashboard', { replace: true });
    else setError(res.message || 'Could not change password');
  };

  return (
    <AuthShell
      title={forced ? 'Choose a new password' : 'Change password'}
      subtitle={forced ? 'You signed in with a temporary password. Set your own to continue.' : 'Update the password for your account.'}
      footer={
        <button type="button" onClick={() => { logout(); navigate('/login'); }} className="underline hover:text-slate-300">
          Sign out
        </button>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <Alert>{error}</Alert>}
        <Field id="current" type="password" label={forced ? 'Temporary password' : 'Current password'} value={form.current} onChange={set('current')} autoFocus />
        <Field id="next" type="password" label="New password" hint="Min. 8 characters" value={form.next} onChange={set('next')} />
        <Field id="confirm" type="password" label="Confirm new password" value={form.confirm} onChange={set('confirm')} />
        <SubmitButton id="change-password-submit" loading={loading}>Update password</SubmitButton>
      </form>
    </AuthShell>
  );
};
