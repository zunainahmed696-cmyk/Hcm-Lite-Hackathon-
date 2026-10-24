import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User';
import { Settings } from '../models/Settings';
import { AppError } from '../utils/AppError';
import { JWTPayload } from '../types';
import { recordAudit } from './audit.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getJwtSecret = (): string =>
  process.env.JWT_SECRET || 'super_secret_hackathon_jwt_key_2026_change_in_production';

export const signToken = (user: IUserDocument): string => {
  const payload: JWTPayload = { userId: user._id.toString(), email: user.email, role: user.role };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

export const toPublicUser = (user: IUserDocument) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
  createdAt: user.createdAt,
});

const assertPassword = (password: unknown): string => {
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters.', 422);
  }
  return password;
};

export const isSetupComplete = async (): Promise<boolean> => (await Settings.countDocuments()) > 0;

interface SetupInput {
  companyName?: string;
  adminName?: string;
  email?: string;
  password?: string;
}

/** First-run setup (functionality #01): creates the company profile and the one Admin. Only works once. */
export const runFirstSetup = async (input: SetupInput) => {
  if (await isSetupComplete()) throw new AppError('Setup has already been completed.', 409);

  const companyName = input.companyName?.trim();
  const adminName = input.adminName?.trim() || 'Admin';
  const email = input.email?.trim().toLowerCase();
  if (!companyName) throw new AppError('Company name is required.', 422);
  if (!email || !EMAIL_RE.test(email)) throw new AppError('A valid admin email is required.', 422);
  const password = assertPassword(input.password);

  await Settings.create({ companyName });
  const admin = await User.create({ name: adminName, email, password, role: 'admin' });

  await recordAudit({
    actor: { userId: admin._id.toString(), email: admin.email, role: 'admin' },
    action: 'SETUP',
    entity: 'Company',
    after: { companyName, adminEmail: email },
  });

  return admin;
};

export const authenticateUser = async (emailRaw: unknown, password: unknown): Promise<IUserDocument> => {
  if (typeof emailRaw !== 'string' || typeof password !== 'string' || !emailRaw || !password) {
    throw new AppError('Please provide both email and password.', 400);
  }
  const user = await User.findOne({ email: emailRaw.trim().toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password.', 401);
  if (!user.isActive) throw new AppError('This account has been deactivated. Contact your administrator.', 403);
  return user;
};

export const changeUserPassword = async (userId: string, currentPassword: unknown, newPassword: unknown) => {
  const next = assertPassword(newPassword);
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found.', 404);
  if (typeof currentPassword !== 'string' || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect.', 401);
  }
  if (currentPassword === next) throw new AppError('New password must be different from the current one.', 422);

  user.password = next;
  user.mustChangePassword = false;
  await user.save();
  await recordAudit({
    actor: { userId, email: user.email, role: user.role },
    action: 'CHANGE_PASSWORD',
    entity: 'User',
    entityId: userId,
  });
  return user;
};

/** Env-based first run: creates company + admin from ADMIN_EMAIL / ADMIN_PASSWORD when the DB is empty. */
export const bootstrapFromEnv = async (): Promise<void> => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, COMPANY_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || (await isSetupComplete())) return;
  await runFirstSetup({
    companyName: COMPANY_NAME || 'My Company',
    adminName: 'Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  console.log(`[Setup] Admin created from environment: ${ADMIN_EMAIL}`);
};
