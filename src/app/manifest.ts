import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AutoPing — Never Miss a Service',
    short_name: 'AutoPing',
    description: 'Track maintenance intervals, diagnose vehicle health, estimate service costs, and book verified service center slots.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F9FC',
    theme_color: '#2563EB',
    orientation: 'portrait-primary',
    categories: ['utilities', 'productivity', 'auto'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Book Service Slot',
        short_name: 'Book',
        description: 'Book a certified service bay appointment',
        url: '/services/book',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'My Vehicles',
        short_name: 'Garage',
        description: 'View registered vehicle health and odometer',
        url: '/vehicles',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Service Bookings',
        short_name: 'Bookings',
        description: 'Check appointment slots and invoices',
        url: '/bookings',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'AI Diagnostic Assistant',
        short_name: 'Assistant',
        description: 'Interactive voice & vehicle assistant',
        url: '/assistant',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
