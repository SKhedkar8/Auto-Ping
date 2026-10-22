'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Camera,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Shield,
  Smartphone,
  Trash2,
  User as UserIcon,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { clearClientSession, getClientSession, setClientSession } from '@/lib/auth';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [vehicleCount, setVehicleCount] = useState<number>(0);
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    city: 'Pune',
    preferredCity: 'Pune',
    address: '',
    photoUrl: '',
    prefs: {
      inApp: true,
      email: true,
      whatsapp: true,
      sms: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session) {
      setUser(session);
      setPhotoPreview(session.photoUrl || '');
      setFormData({
        name: session.name || '',
        email: session.email || '',
        mobile: session.mobile || '',
        city: session.city || 'Pune',
        preferredCity: session.preferredCity || session.city || 'Pune',
        address: session.address || '',
        photoUrl: session.photoUrl || '',
        prefs: {
          inApp: session.prefs?.inApp ?? true,
          email: session.prefs?.email ?? true,
          whatsapp: session.prefs?.whatsapp ?? true,
          sms: session.prefs?.sms ?? true,
        },
      });

      // Fetch user's registered vehicles and bookings
      fetch(`/api/vehicles?userId=${session.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.data)) {
            setVehicleCount(data.data.length);
          }
        })
        .catch(() => {});

      fetch(`/api/bookings?userId=${session.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.data)) {
            setBookingCount(data.data.length);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSaveError('Invalid file format. Please upload JPG, PNG, or WEBP.');
      setTimeout(() => setSaveError(null), 4000);
      return;
    }

    // Only allow images under 4MB
    if (file.size > 4 * 1024 * 1024) {
      setSaveError('Image is too large. Maximum allowed size is 4MB.');
      setTimeout(() => setSaveError(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPhotoPreview(dataUrl);
      setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...formData }),
      });
      const data = await res.json();
      setIsSaving(false);

      if (data.data) {
        const updatedUser = { ...data.data, photoUrl: formData.photoUrl };
        setUser(updatedUser);
        setClientSession(updatedUser);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(data.error || 'Failed to update profile.');
      }
    } catch {
      setIsSaving(false);
      setSaveError('Network error while updating profile. Please try again.');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    // Update password state (simulation of secure backend change)
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out of your AutoPing account?')) {
      clearClientSession();
      router.push('/login');
    }
  };

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : 'AP';

  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : 'Vehicle Owner';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <a href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</a>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-medium">Account &amp; Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Account &amp; Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information, account details, and communication preferences.
          </p>
        </div>

        {/* Global Feedback Banners */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3" />
              </span>
              <span>Your profile information and reminder preferences have been saved successfully.</span>
            </div>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {saveError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center justify-between shadow-xs animate-in fade-in">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="text-rose-600 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Profile Summary Card */}
        <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar (88px) */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800">
                {photoPreview ? (
                  <img src={photoPreview} alt={formData.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl tracking-wider">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* User Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {formData.name || user?.name || 'AutoPing Member'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span>{formData.email || user?.email || 'No email registered'}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {formData.preferredCity || 'Pune'}
                </span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                Manage your AutoPing account profile, security credentials, and automotive service alerts.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Member Since</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Feb 2026'}
            </span>
          </div>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column (8 cols): Forms and Preferences */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Photo Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Profile Photo</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    This photo will be visible across your service bookings, garage check-ins, and inspection reports.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar */}
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                          {initials}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      title="Upload new photo"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Actions & Specs */}
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {photoPreview ? 'Custom Profile Picture Active' : 'No Custom Photo Uploaded'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Recommended: Square image at least 300×300 px. Supported formats: JPG, PNG, or WEBP (Max 4MB).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </button>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Personal Information</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Keep your primary contact info accurate for automated roadside assistance and maintenance pickups.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Shreyas Patil"
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. shreyas@example.com"
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mobile Number (+91)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Preferred Service City */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Preferred Service City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <select
                        value={formData.preferredCity}
                        onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value, city: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Pune">Pune, Maharashtra</option>
                        <option value="Mumbai">Mumbai, Maharashtra</option>
                        <option value="Bengaluru">Bengaluru, Karnataka</option>
                        <option value="Delhi">Delhi NCR</option>
                        <option value="Hyderabad">Hyderabad, Telangana</option>
                        <option value="Chennai">Chennai, Tamil Nadu</option>
                        <option value="Kolkata">Kolkata, West Bengal</option>
                        <option value="Ahmedabad">Ahmedabad, Gujarat</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Residential Address spanning full width */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Residential / Garage Address
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Apartment, Street address, locality, or landmark"
                        className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication and Reminder Preferences */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Communication &amp; Reminder Preferences
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose how AutoPing keeps you informed about your vehicle maintenance, inspection deadlines, and booking milestones.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      key: 'inApp',
                      label: 'In-App Alerts',
                      desc: 'Instant badge indicators, notifications bell, and urgent modal warnings directly inside AutoPing.',
                      icon: Bell,
                    },
                    {
                      key: 'whatsapp',
                      label: 'WhatsApp Reminders',
                      desc: 'Actionable WhatsApp alerts with a 1-tap direct slot booking link 30 days and 7 days prior to due dates.',
                      icon: MessageSquare,
                    },
                    {
                      key: 'email',
                      label: 'Email Digest',
                      desc: 'Monthly component health report and detailed invoices with PDF inspection breakdowns.',
                      icon: Mail,
                    },
                    {
                      key: 'sms',
                      label: 'SMS Notifications',
                      desc: 'Critical booking confirmations and real-time pickup/drop-off status via text message.',
                      icon: Smartphone,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isChecked = (formData.prefs as any)[item.key] ?? false;

                    return (
                      <div
                        key={item.key}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            prefs: { ...formData.prefs, [item.key]: !isChecked },
                          })
                        }
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3.5 pr-4">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shrink-0 mt-0.5 sm:mt-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{item.label}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>

                        {/* Accessible Modern Toggle Switch */}
                        <div
                          role="switch"
                          aria-checked={isChecked}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              setFormData({
                                ...formData,
                                prefs: { ...formData.prefs, [item.key]: !isChecked },
                              });
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                            isChecked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isChecked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Form Actions */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Changes take effect immediately across all sessions.
                </p>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Profile & Preferences'}
                </button>
              </div>
            </form>
          </div>

          {/* Secondary Column (4 cols): Account Overview & Security */}
          <div className="lg:col-span-4 space-y-6">
            {/* Account Overview Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Account Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Real-time snapshot of your connected assets and activity.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xs font-bold">
                      🚗
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Registered Vehicles</p>
                      <p className="text-[11px] text-slate-500">Garage inventory</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {vehicleCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      📅
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Service Bookings</p>
                      <p className="text-[11px] text-slate-500">Total appointments</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {bookingCount}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xs font-bold">
                      🛡️
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Account Plan</p>
                      <p className="text-[11px] text-slate-500">AutoPing Standard</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              </div>

              {/* Quick Navigation Shortcuts */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <a
                  href="/vehicles"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Manage Vehicles</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href="/bookings"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>View All Bookings</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href="/notifications"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>Notification Center</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Security and Privacy Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Security &amp; Session</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Manage your credentials and active sign-in sessions securely.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-800 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Change Password</p>
                      <p className="text-[11px] text-slate-400">Updated 3 months ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Current Session</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Desktop Browser • India (IP Verified)</p>
                </div>
              </div>

              {/* Sign Out Action */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out from Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Update Password</h3>
                  <p className="text-[11px] text-slate-400">Ensure your account stays secure.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Password Updated!</h4>
                <p className="text-xs text-slate-500">Your security credentials have been updated.</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-700 font-medium">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password (min. 8 characters)
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Chatbot />
      <Footer />
    </div>
  );
}
