import {
  LayoutDashboard, Building2, Users, Clock, CalendarDays, Wallet, Megaphone,
  Bell, ScrollText, Sparkles, UserCircle, ShieldCheck, LucideIcon,
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  /** Which build phase delivers this screen (shown on the placeholder page). */
  phase: string;
  description: string;
}

// Single source of truth for sidebar menus AND route guards (brief section 8).
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'employee'], phase: 'Phase 8', description: 'KPIs, trends and AI summary for your role.' },
  { path: '/organization', label: 'Organization', icon: Building2, roles: ['admin', 'hr'], phase: 'Phase 2', description: 'Company settings, departments, designations, leave types and holidays.' },
  { path: '/users', label: 'Logins', icon: ShieldCheck, roles: ['admin'], phase: 'Phase 2', description: 'Create HR logins, deactivate or reset any login.' },
  { path: '/employees', label: 'Employees', icon: Users, roles: ['admin', 'hr', 'employee'], phase: 'Phase 3', description: 'Directory, Employee 360 profile and CSV import/export.' },
  { path: '/attendance', label: 'Attendance', icon: Clock, roles: ['admin', 'hr', 'employee'], phase: 'Phase 4', description: 'Check in/out, calendar, daily board and corrections.' },
  { path: '/leave', label: 'Leave', icon: CalendarDays, roles: ['admin', 'hr', 'employee'], phase: 'Phase 5', description: 'Apply, balance, approvals and smart leave.' },
  { path: '/payroll', label: 'Payroll', icon: Wallet, roles: ['admin', 'hr', 'employee'], phase: 'Phase 6', description: 'Salary structures, monthly runs and payslips.' },
  { path: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['admin', 'hr', 'employee'], phase: 'Phase 7', description: 'Company-wide announcements.' },
  { path: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'hr', 'employee'], phase: 'Phase 7', description: 'Leave decisions, payslips and more.' },
  { path: '/audit', label: 'Audit log', icon: ScrollText, roles: ['admin'], phase: 'Phase 7', description: 'Every important action with before/after values.' },
  { path: '/assistant', label: 'AI Assistant', icon: Sparkles, roles: ['admin', 'hr', 'employee'], phase: 'Phase 9', description: 'Ask questions answered from real data, within your access.' },
  { path: '/profile', label: 'My profile', icon: UserCircle, roles: ['admin', 'hr', 'employee'], phase: 'Phase 3', description: 'Your details; edit phone and address.' },
];

export const navForRole = (role: UserRole): NavItem[] => NAV_ITEMS.filter((i) => i.roles.includes(role));

export const ROLE_LABEL: Record<UserRole, string> = { admin: 'Admin', hr: 'HR', employee: 'Employee' };
