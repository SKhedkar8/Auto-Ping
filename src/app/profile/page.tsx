'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Camera,
  Check,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Shield,
  Smartphone,
  Trash2,
  User as UserIcon
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession, setClientSession } from '@/lib/auth';
import { User } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
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
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images under 4MB
    if (file.size > 4 * 1024 * 1024) {
      alert('Image is too large. Please choose an image under 4MB.');
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
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setIsSaving(false);
      alert('Error updating profile');
    }
  };

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen flex flex-col gradient-mesh">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Account &amp; Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personal details, profile photo, preferred service location, and communication channels.
          </p>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Profile changes saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Photo Card */}
          <div className="glass-card p-6 sm:p-8 border border-white dark:border-slate-700/50 shadow-xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
              Profile Photo
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Preview */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-md">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center text-white font-extrabold text-3xl">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Camera overlay on hover */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Upload instructions */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {photoPreview ? 'Profile photo set' : 'Upload your profile photo'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    JPG, PNG or WEBP · Max 4MB · Displayed in the navigation bar and booking confirmation screens
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
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
          <div className="glass-card p-6 sm:p-8 border border-white dark:border-slate-700/50 shadow-xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-5 pb-3 border-b border-slate-100 dark:border-slate-700">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile (+91)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    maxLength={10}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Service City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={formData.preferredCity}
                    onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value, city: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address or locality"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="glass-card p-6 sm:p-8 border border-white dark:border-slate-700/50 shadow-xl">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-2">
              Communication &amp; Reminder Channels
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Choose how you want to be notified 30 days and 7 days prior to service intervals.
            </p>

            <div className="space-y-3">
              {[
                { key: 'inApp', label: 'In-App Alerts', desc: 'Bell icon badges and floating dashboard notifications', icon: Bell },
                { key: 'whatsapp', label: 'WhatsApp Reminders', desc: 'Instant WhatsApp message with direct slot booking link', icon: MessageSquare },
                { key: 'email', label: 'Email Digest', desc: 'Comprehensive component health diagnostics report sent to your inbox', icon: Mail },
                { key: 'sms', label: 'SMS Notifications', desc: 'Time slot reminders 2 hours before scheduled garage drop-off', icon: Smartphone },
              ].map((item) => {
                const Icon = item.icon;
                const isChecked = (formData.prefs as any)[item.key];

                return (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.label}</h4>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prefs: { ...formData.prefs, [item.key]: e.target.checked },
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded-md focus:ring-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl gradient-primary text-white font-extrabold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Profile & Preferences'}
            </button>
          </div>
        </form>
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}
