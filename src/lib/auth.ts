import { User } from './types';

export const DEMO_CUSTOMER_USER: User = {
  id: 'user-customer-1',
  name: 'User',
  email: 'User@gmail.com',
  mobile: '123456789',
  role: 'CUSTOMER',
  city: 'Pune',
  preferredCity: 'Pune',
  isActive: true,
  createdAt: '2026-02-15T10:00:00.000Z',
};

export const DEMO_ADMIN_USER: User = {
  id: 'user-admin-1',
  name: 'Auto Ping Admin',
  email: 'admin@autoping.com',
  mobile: '9999900000',
  role: 'ADMIN',
  city: 'Pune',
  preferredCity: 'Pune',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Client-side authentication helpers
const SESSION_KEY = 'autoping_session_user';

export function getClientSession(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) {
    // Keep demo access generic until a visitor signs in or creates an account.
    localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_CUSTOMER_USER));
    return DEMO_CUSTOMER_USER;
  }
  try {
    const user: User = JSON.parse(stored);
    if (user && (user.email?.toLowerCase() === 'shreyas@example.com' || user.name?.toLowerCase().startsWith('shreyas'))) {
      user.name = DEMO_CUSTOMER_USER.name;
      user.email = DEMO_CUSTOMER_USER.email;
      user.mobile = DEMO_CUSTOMER_USER.mobile;
      delete user.address;
      delete user.photoUrl;
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    return null;
  }
}

export function setClientSession(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  // Dispatch storage event so components reactive update
  window.dispatchEvent(new Event('autoping_session_change'));
}

export function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('autoping_session_change'));
}
