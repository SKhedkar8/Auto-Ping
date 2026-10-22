/**
 * roleTransition.ts
 * 
 * Helper for triggering the shared automotive startup intro animation
 * when transitioning between Customer and Admin modes.
 */
import { DEMO_ADMIN_USER, DEMO_CUSTOMER_USER, setClientSession } from '@/lib/auth';

export function switchUserRoleWithAnimation(
  targetRole: 'CUSTOMER' | 'ADMIN',
  targetUrl?: string
) {
  if (typeof window === 'undefined') return;

  const dest = targetUrl || (targetRole === 'ADMIN' ? '/admin' : '/dashboard');

  let handled = false;
  const onAck = () => {
    handled = true;
  };
  window.addEventListener('autoping_role_switch_ack', onAck, { once: true });

  window.dispatchEvent(
    new CustomEvent('autoping_role_switch_request', {
      detail: {
        targetRole,
        targetUrl: dest,
      },
    })
  );

  // Safety fallback: if no listener handles the animation within 350ms,
  // update the session and navigate immediately to ensure the button ALWAYS works.
  setTimeout(() => {
    window.removeEventListener('autoping_role_switch_ack', onAck);
    if (!handled) {
      if (targetRole === 'ADMIN') {
        setClientSession(DEMO_ADMIN_USER);
      } else {
        setClientSession(DEMO_CUSTOMER_USER);
      }
      window.location.href = dest;
    }
  }, 350);
}
