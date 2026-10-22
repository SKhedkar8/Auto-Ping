/**
 * roleTransition.ts
 * 
 * Helper for triggering the shared automotive startup intro animation
 * when transitioning between Customer and Admin modes.
 */

export function switchUserRoleWithAnimation(
  targetRole: 'CUSTOMER' | 'ADMIN',
  targetUrl?: string
) {
  if (typeof window === 'undefined') return;

  const dest = targetUrl || (targetRole === 'ADMIN' ? '/admin' : '/dashboard');

  window.dispatchEvent(
    new CustomEvent('autoping_role_switch_request', {
      detail: {
        targetRole,
        targetUrl: dest,
      },
    })
  );
}
