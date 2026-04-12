/**
 * StudentProfilePage - Student Profile View
 * Display student information, statistics, and account settings
 * Uses real APIs from backend ProfileController
 */

import { useState } from 'react';
import {
  User, Mail, Phone, Briefcase, Calendar, Shield,
  Camera, Edit2, Save, QrCode,
  ChevronRight, Eye, EyeOff, Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../store/useAuthStore';
import { RecentActivity, type Activity } from '../../components/common/RecentActivity';
import { useToast } from '../../hooks/useToast';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useRecentActivities,
  useStudentStatistics,
  useUploadAvatar,
} from '../../features/profile';

export default function StudentProfilePage() {
  const appAlert = useToast();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Local state for form inputs
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // API calls
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { data: statsData, isLoading: statsLoading } = useStudentStatistics();
  const { data: recentActivitiesData, isLoading: activitiesLoading } = useRecentActivities(10);
  
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadAvatarMutation = useUploadAvatar();

  // Set form data when profile loads
  const [editFormData, setEditFormData] = useState({
    fullName: (profileData as any)?.fullName || '',
    email: (profileData as any)?.email || '',
    phone: '',
    bio: '',
  });

  // Use profile data or fallback
  const userData = (profileData || {
    id: user?.Id || '',
    fullName: (profileData as any)?.fullName || 'Student',
    email: (profileData as any)?.email || '',
    userImageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    userCode: '',
  }) as any;

  // Convert stats data
  const stats = (statsData || {
    totalClassesAttended: 0,
    weekAttendanceRate: 0,
    currentStreak: 0,
    totalClasses: 0,
    todayAttendance: false,
  }) as any;

  // Convert recent activities
  const recentActivities: Activity[] = (Array.isArray(recentActivitiesData) ? recentActivitiesData : []).map((activity: any, idx: number) => ({
    id: activity.id || String(idx),
    type: activity.type || 'booking',
    title: activity.title,
    description: activity.description,
    timestamp: activity.timestamp,
  }));

  let profileCompletion = statsLoading ? 0 : Math.min(85, ((statsData as any)?.totalClassesAttended || 0) * 2);

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(editFormData);
      appAlert.success('Profile Updated', 'Your profile has been updated successfully', 3000);
      setIsEditing(false);
    } catch (error) {
      appAlert.error('Update Failed', 'Failed to update profile', 3000);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      appAlert.error('Mismatch', 'New password and confirmation do not match', 3000);
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      appAlert.success('Password Changed', 'Your password has been updated successfully', 3000);
      setShowPasswordChange(false);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      appAlert.error('Password Change Failed', 'Failed to change password', 3000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatarMutation.mutateAsync(file);
      appAlert.success('Avatar Updated', 'Your avatar has been updated successfully', 3000);
    } catch (error) {
      appAlert.error('Upload Failed', 'Failed to upload avatar', 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {isEditing ? (
              <>
                <Save size={18} /> Save
              </>
            ) : (
              <>
                <Edit2 size={18} /> Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        {profileLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          </div>
        )}

        {/* Profile Data Loaded */}
        {!profileLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                {/* Avatar Section */}
                <div className="flex items-end gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <img
                      src={userData.userImageUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
                      alt={userData.fullName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                        <Camera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={uploadAvatarMutation.isPending}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userData.fullName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Student</p>
                    {userData.userCode && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        ID: {userData.userCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <User size={16} className="inline mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{userData.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{userData.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{editFormData.phone || '-'}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Briefcase size={16} className="inline mr-2" />
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{editFormData.bio || '-'}</p>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Security Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mt-8">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Shield size={20} className="text-blue-600" />
                    Security & Password
                  </h3>
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    {showPasswordChange ? 'Cancel' : 'Change Password'} <ChevronRight size={16} />
                  </button>
                </div>

                {showPasswordChange && (
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Change Button */}
                    <button
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Updating...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Activities */}
              {!activitiesLoading && recentActivities.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activities</h3>
                  <RecentActivity activities={recentActivities} maxItems={10} />
                </div>
              )}
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Statistics Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Attendance Stats</h3>
                {statsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Calendar size={16} className="inline mr-2" />
                          Total Classes
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.totalClasses}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Classes Attended</span>
                        <span className="font-bold text-green-600">{stats.totalClassesAttended}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Week Attendance</span>
                        <span className="font-bold text-blue-600">{Math.round(stats.weekAttendanceRate)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stats.weekAttendanceRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Streak</span>
                        <span className="font-bold text-orange-600">{stats.currentStreak} days</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <QrCode size={20} className="text-blue-600" />
                  Your QR Code
                </h3>
                {showQRCode ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCodeSVG
                        value={userData.id || user?.Id || 'student-id'}
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <button
                      onClick={() => setShowQRCode(false)}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Hide QR Code
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQRCode(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Show QR Code
                  </button>
                )}
              </div>

              {/* Profile Completion */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Completion</h3>
                <div className="mb-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{Math.round(profileCompletion)}% Complete</p>
                {isEditing && (
                  <p className="text-xs text-blue-600 mt-2">Complete your profile information to increase completion!</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
