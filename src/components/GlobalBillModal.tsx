'use client';

import React, { useState, useEffect } from 'react';
import { ServiceInvoice } from '@/lib/types';
import ServiceBillModal from './ServiceBillModal';

/**
 * GlobalBillModal
 * 
 * Listens for 'autoping_open_bill' global events so notifications, navbar,
 * and page components can effortlessly open the Bill / Tax Invoice popup
 * in the center of the screen from anywhere across the website.
 */
export default function GlobalBillModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [invoice, setInvoice] = useState<ServiceInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpenBill = async (e: Event) => {
      const ce = e as CustomEvent<{ bookingId?: string; invoice?: ServiceInvoice }>;
      const { bookingId, invoice: directInvoice } = ce.detail || {};

      if (directInvoice) {
        setInvoice(directInvoice);
        setIsOpen(true);
        return;
      }

      if (bookingId) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/bookings/${bookingId}/invoice`);
          const json = await res.json();
          if (json.data) {
            setInvoice(json.data);
            setIsOpen(true);
          }
        } catch {
          console.error('Failed to fetch invoice for booking:', bookingId);
        } finally {
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('autoping_open_bill', handleOpenBill);
    return () => window.removeEventListener('autoping_open_bill', handleOpenBill);
  }, []);

  return (
    <ServiceBillModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      invoice={invoice}
    />
  );
}
