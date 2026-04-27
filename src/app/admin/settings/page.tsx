"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Lock, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const adminRef = doc(db, 'settings', 'admin');
      const adminSnap = await getDoc(adminRef);
      
      let currentStoredPassword = 'admin123';
      if (adminSnap.exists()) {
        currentStoredPassword = adminSnap.data().password;
      }

      if (formData.currentPassword !== currentStoredPassword) {
        toast.error('Incorrect current password');
        setLoading(false);
        return;
      }

      await setDoc(adminRef, {
        username: formData.username,
        password: formData.newPassword,
        updatedAt: new Date()
      }, { merge: true });

      toast.success('Password updated successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-primary-50 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-gray-500">Manage your security and account preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          Change Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
              <input
                required
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            <hr className="border-gray-50" />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
              <input
                required
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
              <input
                required
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="w-5 h-5" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
