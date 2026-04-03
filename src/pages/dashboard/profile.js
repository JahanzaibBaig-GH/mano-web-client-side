import Head from 'next/head';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { showToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const genders = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || user?.date_of_birth || '',
    gender: user?.gender || '',
    bloodType: user?.bloodType || user?.blood_type || 'Unknown',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || user?.emergency_contact || '',
  });

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone ?? prev.phone,
        dateOfBirth: user.dateOfBirth ?? user.date_of_birth ?? prev.dateOfBirth,
        gender: user.gender ?? prev.gender,
        bloodType: user.bloodType ?? user.blood_type ?? prev.bloodType,
        address: user.address ?? prev.address,
        emergencyContact: user.emergencyContact ?? user.emergency_contact ?? prev.emergencyContact,
      }));
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileData.name.trim()) errs.name = 'Name is required';
    if (!profileData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) errs.email = 'Invalid email';
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordData.currentPassword) errs.currentPassword = 'Current password required';
    if (!passwordData.newPassword) errs.newPassword = 'New password required';
    else if (passwordData.newPassword.length < 8) errs.newPassword = 'Min 8 characters';
    if (!passwordData.confirmPassword) errs.confirmPassword = 'Confirm new password';
    else if (passwordData.newPassword !== passwordData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setProfileLoading(true);
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth || null,
        gender: profileData.gender,
        blood_type: profileData.bloodType,
        address: profileData.address,
        emergency_contact: profileData.emergencyContact
      };
      await api.patch('/auth/profile', payload);
      await refreshProfile?.();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return; }
    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword
      });
      showToast('Password changed successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await api.delete('/auth/account');
      await logout();
    } catch {
      showToast('Failed to delete account. Please contact support.', 'error');
    }
  };

  return (
    <ProtectedRoute>
      <Head><title>Profile Settings – Mano App</title></Head>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your personal information and account settings.</p>
        </div>

        {/* Profile header card */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-2xl p-5 mb-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-extrabold">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-lg">{user?.name || 'User'}</p>
              <p className="text-teal-100 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-medium bg-white/90 text-teal-800 px-2 py-0.5 rounded-full capitalize">
                {user?.role || 'user'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
          {[{ id: 'profile', label: 'Profile Info' }, { id: 'security', label: 'Security' }, { id: 'danger', label: 'Danger Zone' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? tab.id === 'danger' ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'
                  : tab.id === 'danger' ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Info */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
            <form onSubmit={handleProfileSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input name="name" value={profileData.name} onChange={handleProfileChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${profileErrors.name ? 'border-red-400' : 'border-gray-200'}`} />
                  {profileErrors.name && <p className="mt-0.5 text-xs text-red-500">{profileErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input name="email" type="email" value={profileData.email} onChange={handleProfileChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${profileErrors.email ? 'border-red-400' : 'border-gray-200'}`} />
                  {profileErrors.email && <p className="mt-0.5 text-xs text-red-500">{profileErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input name="phone" type="tel" value={profileData.phone} onChange={handleProfileChange} placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input name="dateOfBirth" type="date" value={profileData.dateOfBirth} onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select name="gender" value={profileData.gender} onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white">
                    <option value="">Select gender</option>
                    {genders.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <select name="bloodType" value={profileData.bloodType} onChange={handleProfileChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white">
                    {bloodTypes.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input name="emergencyContact" value={profileData.emergencyContact} onChange={handleProfileChange} placeholder="Name & phone number"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input name="address" value={profileData.address} onChange={handleProfileChange} placeholder="City, Country"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
                </div>
              </div>
              <button type="submit" disabled={profileLoading}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
                {profileLoading ? <><LoadingSpinner size="sm" /> Saving…</> : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input name="currentPassword" type={showCurrentPass ? 'text' : 'password'} value={passwordData.currentPassword} onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowCurrentPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showCurrentPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                      </svg>
                    </button>
                  </div>
                  {passwordErrors.currentPassword && <p className="mt-0.5 text-xs text-red-500">{passwordErrors.currentPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input name="newPassword" type={showNewPass ? 'text' : 'password'} value={passwordData.newPassword} onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${passwordErrors.newPassword ? 'border-red-400' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowNewPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showNewPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                      </svg>
                    </button>
                  </div>
                  {passwordErrors.newPassword && <p className="mt-0.5 text-xs text-red-500">{passwordErrors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 ${passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`} />
                  {passwordErrors.confirmPassword && <p className="mt-0.5 text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>
              <button type="submit" disabled={passwordLoading}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
                {passwordLoading ? <><LoadingSpinner size="sm" /> Updating…</> : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && (
          <div className="bg-white rounded-2xl border border-red-200 p-5">
            <h2 className="font-bold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-gray-500 text-sm mb-5">These actions are permanent and cannot be reversed.</p>
            <div className="border border-red-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Delete Account</p>
                <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all associated data.</p>
              </div>
              <button onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
