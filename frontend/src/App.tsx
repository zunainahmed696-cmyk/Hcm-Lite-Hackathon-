import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Landing } from './pages/Landing';
import { Setup } from './pages/Setup';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { ComingSoon } from './pages/ComingSoon';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';
import { Organization } from './pages/Organization';
import { Logins } from './pages/Logins';
import { Employees } from './pages/Employees';
import { NAV_ITEMS } from './config/nav';

// Real pages by path; anything missing falls back to <ComingSoon />.
const PAGES: Record<string, React.ReactElement> = {
  '/organization': <Organization />,
  '/users': <Logins />,
  '/employees': <Employees />,
};

export const App: React.FC = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Landing />} />
    <Route path="/setup" element={<Setup />} />
    <Route path="/signup" element={<Setup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/change-password" element={<ChangePassword />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    {/* Authenticated app: one route per menu item, guarded by the roles in config/nav.ts.
        Swap <ComingSoon /> for the real page as each phase is built. */}
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      {NAV_ITEMS.map((item) => (
        <Route
          key={item.path}
          path={item.path}
          element={
            <ProtectedRoute allowedRoles={item.roles}>
              {PAGES[item.path] ?? <ComingSoon />}
            </ProtectedRoute>
          }
        />
      ))}
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
