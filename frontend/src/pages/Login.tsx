import React, { useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthShell } from '../components/AuthShell';
import { Alert, Field, FullPageSpinner, SubmitButton } from '../components/ui';

export const Login: React.FC = () => {
  const { login, isAuthenticated, user, isLoading, setupComplete } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoading || setupComplete === null) return <FullPageSpinner />;
  if (!setupComplete) return <Navigate to="/setup" replace />;
  if (isAuthenticated && user) {
    if (user.mustChangePassword) return <Navigate to="/change-password" replace />;
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    return <Navigate to={from || '/dashboard'} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please enter your email and password.');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) setError(res.message || 'Login failed');
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your HCM Lite account."
      footer="New employee? Your HR team creates your login and gives you a temporary password."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {params.get('expired') && !error && <Alert>Your session expired. Please sign in again.</Alert>}
        {error && <Alert>{error}</Alert>}
        <Field id="email" type="email" label="Email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
        <Field id="password" type="password" label="Password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <SubmitButton id="login-submit" loading={loading}>Sign in</SubmitButton>
      </form>
    </AuthShell>
  );
};
