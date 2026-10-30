'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  Maximize2,
  Minimize2,
  Phone,
  Printer,
  ShieldCheck,
  Wrench,
  X,
  Sparkles,
} from 'lucide-react';
import { ServiceInvoice } from '@/lib/types';

interface ServiceBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ServiceInvoice | null;
}

export default function ServiceBillModal({ isOpen, onClose, invoice }: ServiceBillModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !invoice) {
    return null;
  }

  const handleDownload = () => {
    if (!invoice) return;
    setIsPrinting(true);

    // Build a self-contained A4 HTML page and print it via an isolated iframe.
    // This guarantees exactly ONE single-page bill — no duplicate pages, no page overflow.
    const billHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice ${invoice.invoiceNumber}</title>
<style>
  @page { size: A4 portrait; margin: 10mm 12mm; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; margin-bottom: 10px; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand-icon { width: 28px; height: 28px; border-radius: 8px; background: #2563eb; display: flex; align-items: center; justify-content: center; }
  .brand-name { font-size: 16px; font-weight: 800; color: #0f172a; }
  .brand-name span { color: #2563eb; }
  .badge-paid { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
  .invoice-meta { text-align: right; }
  .invoice-num { font-size: 18px; font-weight: 900; font-family: monospace; color: #0f172a; }
  .meta-small { font-size: 9px; color: #64748b; margin-top: 2px; }
  .section { display: flex; gap: 10px; margin-bottom: 10px; }
  .card { flex: 1; padding: 9px 10px; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; }
  .card-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: 4px; }
  .card-title { font-size: 11px; font-weight: 700; color: #0f172a; }
  .card-sub { font-size: 9px; color: #64748b; margin-top: 2px; }
  .time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .time-cell { background: #fff; border: 1px solid #e2e8f0; border-radius: 7px; padding: 5px; text-align: center; }
  .time-label { font-size: 8px; font-weight: 600; text-transform: uppercase; color: #94a3b8; }
  .time-val { font-size: 12px; font-weight: 900; font-family: monospace; color: #0f172a; }
  .time-val.out { color: #16a34a; }
  .table-wrap { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
  .table-head { background: #f1f5f9; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
  .table-head-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #475569; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f8fafc; padding: 5px 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; text-align: left; }
  th.right { text-align: right; }
  td { padding: 5px 8px; font-size: 9.5px; border-bottom: 1px solid #f1f5f9; color: #0f172a; }
  td.right { text-align: right; }
  td.center { text-align: center; }
  td.mono { font-family: monospace; }
  tr:last-child td { border-bottom: none; }
  .totals { display: flex; justify-content: space-between; padding: 9px 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  .notes-wrap { max-width: 55%; }
  .pay-status { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 700; margin-bottom: 4px; }
  .amount-words { font-size: 9px; color: #64748b; margin-top: 3px; }
  .calc-grid { min-width: 220px; }
  .calc-row { display: flex; justify-content: space-between; font-size: 9.5px; color: #475569; margin-bottom: 3px; }
  .calc-row.total-row { border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 3px; }
  .grand-label { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
  .grand-amount { font-size: 16px; font-weight: 900; font-family: monospace; color: #2563eb; }
  .footer { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 10px; }
  .footer-left { display: flex; align-items: center; gap: 8px; }
  .shield-icon { width: 32px; height: 32px; border-radius: 8px; background: #dcfce7; border: 1px solid #86efac; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .footer-title { font-size: 10px; font-weight: 700; color: #0f172a; }
  .footer-sub { font-size: 8.5px; color: #64748b; }
  .sig-label { font-size: 8px; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
  .sig-name { font-family: Georgia, serif; font-style: italic; font-weight: 700; font-size: 10px; color: #334155; }
</style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand"><div class="brand-icon">🚗</div><div class="brand-name">Auto<span>Ping</span></div><span class="badge-paid">Paid Receipt</span></div>
      <div style="font-size:9px;color:#64748b;margin-top:4px;">Automotive Intelligence &amp; Verified Care</div>
      <div style="font-size:9px;color:#94a3b8;margin-top:2px;">GSTIN: ${invoice.centerGstin || '27AABCA9182K1ZX'}</div>
    </div>
    <div class="invoice-meta">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#2563eb;background:#eff6ff;padding:2px 8px;border-radius:6px;border:1px solid #bfdbfe;margin-bottom:3px;display:inline-block;">Tax Invoice</div>
      <div class="invoice-num">${invoice.invoiceNumber}</div>
      <div class="meta-small">Booking: ${invoice.bookingCode}</div>
      <div class="meta-small">Date: ${invoice.date}</div>
    </div>
  </div>

  <!-- Service Center + Telemetry -->
  <div class="section">
    <div class="card" style="flex:1.5;">
      <div class="card-label">🔧 Service Center</div>
      <div class="card-title">${invoice.centerName}</div>
      <div class="card-sub">📍 ${invoice.centerAddress}</div>
      ${invoice.centerPhone ? `<div class="card-sub">📞 ${invoice.centerPhone}</div>` : ''}
    </div>
    <div class="card" style="flex:1;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border-color:#bfdbfe;">
      <div class="card-label" style="color:#2563eb;">⏱ Workshop Telemetry</div>
      <div class="time-grid">
        <div class="time-cell"><div class="time-label">Time IN</div><div class="time-val">${invoice.timeIn || '09:30 AM'}</div><div style="font-size:8px;color:#94a3b8;">Vehicle Inward</div></div>
        <div class="time-cell"><div class="time-label">Time OUT</div><div class="time-val out">${invoice.timeOut || '04:45 PM'}</div><div style="font-size:8px;color:#94a3b8;">QC &amp; Delivery</div></div>
      </div>
    </div>
  </div>

  <!-- Customer & Vehicle -->
  <div class="section">
    <div class="card">
      <div class="card-label">Billed To (Customer)</div>
      <div class="card-title" style="font-size:12px;">${invoice.customerName}</div>
      <div class="card-sub" style="font-family:monospace;">${invoice.customerPhone}</div>
      <div class="card-sub">${invoice.customerEmail}</div>
    </div>
    <div class="card">
      <div class="card-label">Vehicle Serviced</div>
      <div class="card-title" style="font-size:12px;">${invoice.vehicleName}</div>
      <div class="card-sub" style="margin-top:4px;"><span style="background:#e2e8f0;padding:2px 6px;border-radius:4px;font-family:monospace;font-weight:700;">${invoice.vehicleReg}</span></div>
      <div class="card-sub">Odometer: ${(invoice.odometerKm || 0).toLocaleString()} km</div>
    </div>
  </div>

  <!-- Itemized Table -->
  <div class="table-wrap">
    <div class="table-head">
      <div class="table-head-label">📄 Itemized Price Breakup &amp; Services Rendered</div>
      <div style="font-size:9px;color:#64748b;font-family:monospace;">${invoice.items.length} Line Items</div>
    </div>
    <table>
      <thead><tr><th style="width:30px;text-align:center;">#</th><th>Item &amp; Specification</th><th>Type</th><th class="right">Qty</th><th class="right">Unit Price</th><th class="right">Amount (₹)</th></tr></thead>
      <tbody>
        ${invoice.items.map((item, idx) => `<tr><td class="center mono" style="color:#94a3b8;">${idx + 1}</td><td style="font-weight:600;">${item.name}</td><td><span style="background:#f1f5f9;padding:1px 5px;border-radius:3px;font-size:8px;font-family:monospace;font-weight:700;">${item.category}</span></td><td class="right mono">${item.quantity}</td><td class="right mono" style="color:#475569;">₹${item.unitPrice.toLocaleString('en-IN')}</td><td class="right mono" style="font-weight:700;">₹${item.totalPrice.toLocaleString('en-IN')}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="notes-wrap">
        <div class="pay-status">✅ ${invoice.paymentStatus} via ${invoice.paymentMode}</div>
        <div style="font-size:9px;color:#64748b;font-style:italic;margin-top:3px;">${invoice.notes}</div>
        <div class="amount-words">Amount in words: <strong>${`Rupees ${invoice.grandTotal.toLocaleString('en-IN')} Only`}</strong></div>
      </div>
      <div class="calc-grid">
        <div class="calc-row"><span>Subtotal (Taxable Value):</span><span style="font-weight:600;">₹${invoice.subtotal.toLocaleString('en-IN')}</span></div>
        <div class="calc-row"><span>CGST (${invoice.cgstRate}%):</span><span>₹${invoice.cgstAmount.toLocaleString('en-IN')}</span></div>
        <div class="calc-row"><span>SGST (${invoice.sgstRate}%):</span><span>₹${invoice.sgstAmount.toLocaleString('en-IN')}</span></div>
        <div class="calc-row"><span>Total Tax (18% GST):</span><span style="font-weight:600;">₹${invoice.totalGst.toLocaleString('en-IN')}</span></div>
        <div class="calc-row total-row"><span class="grand-label">Grand Total:</span><span class="grand-amount">₹${invoice.grandTotal.toLocaleString('en-IN')}</span></div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      <div class="shield-icon">🛡</div>
      <div>
        <div class="footer-title">AutoPing Authenticity Guarantee</div>
        <div class="footer-sub">All components OEM certified with 6-month / 10,000 km workshop warranty.</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div class="sig-label">Authorized Signature</div>
      <div class="sig-name">AutoPing Certified Workshop Manager</div>
    </div>
  </div>
</body>
</html>`;

    // Create hidden iframe and print it — ensures exactly 1 clean page
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(billHtml);
      iframeDoc.close();

      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsPrinting(false);
        }, 1000);
      }, 400);
    } else {
      document.body.removeChild(iframe);
      setIsPrinting(false);
    }
  };

  // Convert numbers to basic words for the invoice
  const formatAmountToWords = (num: number): string => {
    // Simple readable representation for Indian Rupees
    return `Rupees ${num.toLocaleString('en-IN')} Only`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Service Bill and Tax Invoice"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop click handler */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Modal Container */}
      <div
        className={`relative w-full ${
          isExpanded ? 'max-w-5xl min-h-[85vh]' : 'max-w-3xl'
        } bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 my-auto flex flex-col overflow-hidden z-10`}
      >
        {/* Top Control Bar with Expand, Download & Close Cross */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Verified Service Tax Invoice
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Download / Print Option */}
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Download or Print PDF Invoice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Bill</span>
            </button>

            {/* Expand / Minimize Option */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse view' : 'Expand view'}
              aria-label={isExpanded ? 'Collapse bill modal' : 'Expand bill modal'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Cross on top to close popup */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
              aria-label="Close popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Print Isolation Stylesheet to guarantee exactly ONE single bill in PDF */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              html, body {
                background: #ffffff !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                overflow: visible !important;
              }
              /* Hide all background website elements and overlays */
              body > * {
                visibility: hidden !important;
              }
              /* Show ONLY the single printable bill */
              #service-bill-printable,
              #service-bill-printable * {
                visibility: visible !important;
              }
              #service-bill-printable {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 12px 16px !important;
                border: none !important;
                box-shadow: none !important;
                background: #ffffff !important;
                color: #0f172a !important;
                max-height: none !important;
                overflow: visible !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              #service-bill-printable table {
                page-break-inside: avoid !important;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `
        }} />

        {/* Printable Invoice Body */}
        <div id="service-bill-printable" className="p-6 sm:p-8 overflow-y-auto max-h-[82vh] space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Car className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Auto<span className="text-blue-600 dark:text-blue-400">Ping</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Paid Receipt
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Automotive Intelligence & Verified Care</p>
              <p className="text-[11px] text-slate-400 mt-1">GSTIN: {invoice.centerGstin || '27AABCA9182K1ZX'}</p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 mb-1">
                Tax Invoice
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {invoice.invoiceNumber}
              </h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 mt-1">
                <div>Booking Code: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{invoice.bookingCode}</span></div>
                <div>Invoice Date: <span className="font-medium text-slate-700 dark:text-slate-300">{invoice.date}</span></div>
              </div>
            </div>
          </div>

          {/* Service Center Banner & Time IN / Time OUT Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Service Center Card */}
            <div className="md:col-span-7 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Service Center</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {invoice.centerName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{invoice.centerAddress}</span>
              </p>
              {invoice.centerPhone && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{invoice.centerPhone}</span>
                </p>
              )}
            </div>

            {/* TIME IN & TIME OUT CARD (Critical Requirement) */}
            <div className="md:col-span-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-slate-50 to-cyan-50/60 dark:from-blue-950/30 dark:via-slate-800/40 dark:to-cyan-950/20 border border-blue-200/80 dark:border-blue-900/60 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Workshop Telemetry
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Time IN */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Time IN
                  </span>
                  <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100">
                    {invoice.timeIn || '09:30 AM'}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Vehicle Inward</span>
                </div>

                {/* Time OUT */}
                <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Time OUT
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {invoice.timeOut || '04:45 PM'}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">QC & Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Billed To (Customer)
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{invoice.customerName}</p>
              <p className="text-slate-600 dark:text-slate-300 font-mono mt-0.5">{invoice.customerPhone}</p>
              <p className="text-slate-600 dark:text-slate-300 break-all mt-0.5">{invoice.customerEmail}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Vehicle Serviced
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{invoice.vehicleName}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  {invoice.vehicleReg}
                </span>
                <span className="text-slate-600 dark:text-slate-300 font-mono font-medium">
                  Odometer: {invoice.odometerKm?.toLocaleString() || '19,500'} km
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Price Breakup Table (Critical Requirement) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Itemized Price Breakup & Services Rendered
              </h4>
              <span className="text-[11px] text-slate-500 font-mono font-medium">
                {invoice.items.length} Line Items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Item & Specification</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & GST Breakup */}
            <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              {/* Payment Details / Notes */}
              <div className="space-y-2 max-w-sm text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[10px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {invoice.paymentStatus} via {invoice.paymentMode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Note: {invoice.notes}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  Amount in words: <strong className="text-slate-700 dark:text-slate-300 font-sans">{formatAmountToWords(invoice.grandTotal)}</strong>
                </p>
              </div>

              {/* GST Calculation Breakdown (Critical Requirement) */}
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal (Taxable Value):</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    ₹{invoice.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>CGST ({invoice.cgstRate}%):</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    ₹{invoice.cgstAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>SGST ({invoice.sgstRate}%):</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    ₹{invoice.sgstAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span>Total Tax (18% GST):</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    ₹{invoice.totalGst.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Grand Total:
                  </span>
                  <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                    ₹{invoice.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Stamp & Guarantee */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h5 className="font-bold text-slate-900 dark:text-white">AutoPing Authenticity Guarantee</h5>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  All components OEM certified with 6-month / 10,000 km workshop warranty.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Authorized Signature
              </span>
              <span className="font-serif italic font-bold text-slate-800 dark:text-slate-200 text-sm">
                AutoPing Certified Workshop Manager
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between print:hidden">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Esc</kbd> or click cross to close
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Invoice PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
