import {
  LayoutDashboard, Building2, Users, Clock, CalendarDays, Wallet, Megaphone,
  Bell, ScrollText, Sparkles, UserCircle, ShieldCheck, LucideIcon,
} from 'lucide-react';
import { UserRole } from '../types';

export type NavCategory = 'General' | 'Operations' | 'Finance & Analytics' | 'System';

export interface NavItem {
  path: string;
  label: string;
  category: NavCategory;
  icon: LucideIcon;
  roles: UserRole[];
  /** Which build phase delivers this screen (shown on the placeholder page). */
  phase: string;
  description: string;
}

// Single source of truth for sidebar menus AND route guards (brief section 8).
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', category: 'General', icon: LayoutDashboard, roles: ['admin', 'hr', 'employee'], phase: 'Phase 8', description: 'KPIs, trends and AI summary for your role.' },
  { path: '/announcements', label: 'Announcements', category: 'General', icon: Megaphone, roles: ['admin', 'hr', 'employee'], phase: 'Phase 7', description: 'Company-wide notices and updates.' },
  { path: '/notifications', label: 'Notifications', category: 'General', icon: Bell, roles: ['admin', 'hr', 'employee'], phase: 'Phase 7', description: 'Leave decisions, payslips and system alerts.' },

  { path: '/employees', label: 'Employees', category: 'Operations', icon: Users, roles: ['admin', 'hr', 'employee'], phase: 'Phase 3', description: 'Directory, Employee 360 profile and CSV import/export.' },
  { path: '/attendance', label: 'Attendance', category: 'Operations', icon: Clock, roles: ['admin', 'hr', 'employee'], phase: 'Phase 4', description: 'Check in/out, calendar, daily board and corrections.' },
  { path: '/leave', label: 'Leave', category: 'Operations', icon: CalendarDays, roles: ['admin', 'hr', 'employee'], phase: 'Phase 5', description: 'Apply, balance, approvals and smart leave.' },

  { path: '/payroll', label: 'Payroll', category: 'Finance & Analytics', icon: Wallet, roles: ['admin', 'hr', 'employee'], phase: 'Phase 6', description: 'Salary structures, monthly runs and payslips.' },
  { path: '/assistant', label: 'AI Assistant', category: 'Finance & Analytics', icon: Sparkles, roles: ['admin', 'hr', 'employee'], phase: 'Phase 9', description: 'Ask questions answered from real data, within your access.' },

  { path: '/organization', label: 'Organization', category: 'System', icon: Building2, roles: ['admin', 'hr'], phase: 'Phase 2', description: 'Company settings, departments, designations, leave types and holidays.' },
  { path: '/users', label: 'Logins', category: 'System', icon: ShieldCheck, roles: ['admin'], phase: 'Phase 2', description: 'Create HR logins, deactivate or reset any login.' },
  { path: '/audit', label: 'Audit Log', category: 'System', icon: ScrollText, roles: ['admin'], phase: 'Phase 7', description: 'Every important action with before/after values.' },
  { path: '/profile', label: 'My Profile', category: 'System', icon: UserCircle, roles: ['admin', 'hr', 'employee'], phase: 'Phase 3', description: 'Your details; edit phone and address.' },
];

export const navForRole = (role: UserRole): NavItem[] => NAV_ITEMS.filter((i) => i.roles.includes(role));

export const ROLE_LABEL: Record<UserRole, string> = { admin: 'Admin', hr: 'HR', employee: 'Employee' };

export const ROLE_BADGE_STYLE: Record<UserRole, { variant: 'indigo' | 'emerald' | 'amber'; text: string }> = {
  admin: { variant: 'indigo', text: 'Admin' },
  hr: { variant: 'amber', text: 'HR Officer' },
  employee: { variant: 'emerald', text: 'Employee' },
};
