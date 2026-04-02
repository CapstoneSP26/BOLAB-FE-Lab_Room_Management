/**
 * ProfilePage - Enhanced User Profile with Glassmorphism
 * Premium design with animations and visual effects
 */

import React, { useEffect, useMemo, useState } from 'react';
import { 
  User, Mail, Phone, Briefcase, Calendar, Shield,
  Camera, Edit2, Save, X, Bell, Lock, Eye, EyeOff,
  BookOpen, QrCode, Clock,
  Download, Share2, Flame,
  ChevronRight, Check, AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { RecentActivity, type Activity } from '../../components/common/RecentActivity';
import { useToast } from '../../hooks/useToast';
import {
  useMyProfile,
  useProfileStats,
  useRecentActivities,
  useUpdateMyProfile,
  useUploadAvatar,
} from '../../features/profile/hooks/userProfile';
import { addCacheBuster } from '../../utils/imageCache';

export default function ProfilePage() {
  const appAlert = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    bookingApproved: true,
    bookingRejected: true,
    bookingReminder: true,
    qrSessionCreated: true,
    equipmentReports: true,
    systemAnnouncements: false,
  });

  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const { data: stats, isLoading: isStatsLoading } = useProfileStats();
  const { data: recentActivitiesData, isLoading: isActivitiesLoading } =
    useRecentActivities(10);

  const isProfileDataLoading = isProfileLoading && !profile;
  const isStatsDataLoading = isStatsLoading && !stats;
  const isActivitiesDataLoading = isActivitiesLoading && !recentActivitiesData;

  const updateProfile = useUpdateMyProfile({
    onSuccess: () => {
      setIsEditing(false);
      appAlert.success('Cập nhật hồ sơ', 'Thông tin đã được lưu.');
    },
    onError: (error) => {
      appAlert.error('Cập nhật thất bại', error.message);
    },
  });

  const uploadAvatar = useUploadAvatar({
    onSuccess: () => {
      appAlert.success('Ảnh đại diện', 'Đã cập nhật thành công.');
    },
    onError: (error) => {
      appAlert.error('Tải ảnh thất bại', error.message);
    },
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        department: profile.department ?? '',
        bio: profile.bio ?? '',
      });
    }
  }, [profile]);

  const completionFields = [
    profile?.fullName,
    profile?.email,
    profile?.role,
    profile?.department,
    profile?.phone,
  ];
  const filledFields = completionFields.filter(Boolean).length;
  const profileCompletion = completionFields.length
    ? Math.round((filledFields / completionFields.length) * 100)
    : 0;

  const avatarUrl = useMemo(
    () =>
      addCacheBuster(
        profile?.avatarUrl ||
          profile?.userImageUrl ||
          '/images/user/default-avatar.png',
      ),
    [profile],
  );

  const memberSinceYear = profile?.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : '--';

  const displayName = formData.fullName || profile?.fullName || '—';
  const displayEmail = formData.email || profile?.email || '—';
  const displayPhone = formData.phone || profile?.phone || '—';
  const displayRole = profile?.role || '—';
  const displayDepartment = formData.department || profile?.department || '—';
  const displayBio = formData.bio || profile?.bio || 'Cập nhật giới thiệu của bạn.';
  const shareEmail = profile?.email || formData.email || '';

  const activityItems: Activity[] = useMemo(() => {
    if (!recentActivitiesData) return [];

    const supportedTypes: Activity['type'][] = [
      'booking',
      'qr_generated',
      'report_sent',
      'booking_approved',
      'booking_rejected',
    ];

    return recentActivitiesData.map((item) => {
      const mappedType = supportedTypes.includes(
        item.activityType as Activity['type'],
      )
        ? (item.activityType as Activity['type'])
        : 'booking';

      return {
        id: item.id,
        type: mappedType,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        status: item.status as Activity['status'],
      };
    });
  }, [recentActivitiesData]);

  // Activity Heatmap Data (last 12 weeks, 7 days each)
  const generateHeatmapData = () => {
    const weeks = 12;
    const data = [];
    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        weekData.push({
          date: new Date(Date.now() - (weeks - week) * 7 * 24 * 60 * 60 * 1000 + day * 24 * 60 * 60 * 1000),
          count: Math.floor(Math.random() * 10), // 0-9 activities
        });
      }
      data.push(weekData);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const handleSave = () => {
    updateProfile.mutate({
      FullName: formData.fullName || undefined,
      Email: formData.email || undefined,
      Phone: formData.phone || undefined,
      Department: formData.department || undefined,
      Bio: formData.bio || undefined,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadAvatar.mutate(file);
  };

  const handleExportProfile = () => {
    appAlert.info('Export to PDF', 'Coming soon!');
  };

  const handleShareProfile = () => {
    setShowQRCode(!showQRCode);
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-200';
    if (count <= 4) return 'bg-green-300';
    if (count <= 6) return 'bg-green-400';
    if (count <= 8) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              My Profile
              <span className="text-lg font-normal text-gray-500">✨</span>
            </h1>
            <p className="text-gray-600">Manage your account and view your achievements</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleExportProfile}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all hover:scale-105 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card with Glassmorphism */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10 rounded-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="inline-block mb-6">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isProfileDataLoading ? 'Đang tải...' : displayName}
                  </h2>
                  <p className="text-orange-600 font-semibold mb-1">{displayRole}</p>
                  <p className="text-sm text-gray-600 mb-4">{displayDepartment}</p>


                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" />
                      <span className="text-gray-700 font-medium">Notifications</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {isStatsDataLoading && (
                <div className="col-span-2 text-xs text-gray-500">
                  Loading statistics...
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-blue-200">
                <BookOpen className="w-6 h-6 mb-2 text-blue-600" />
                <p className="text-2xl font-bold mb-1 text-blue-900">
                  <AnimatedCounter value={stats?.totalBookings ?? 0} />
                </p>
                <p className="text-xs text-blue-700">Total Bookings</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-green-200">
                <QrCode className="w-6 h-6 mb-2 text-green-600" />
                <p className="text-2xl font-bold mb-1 text-green-900">
                  <AnimatedCounter value={stats?.totalQASessions ?? 0} />
                </p>
                <p className="text-xs text-green-700">QA Sessions</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-purple-200">
                <Clock className="w-6 h-6 mb-2 text-purple-600" />
                <p className="text-2xl font-bold mb-1 text-purple-900">
                  <AnimatedCounter value={stats?.totalHoursTaught ?? 0} />
                </p>
                <p className="text-xs text-purple-700">Hours Taught</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-orange-200">
                <User className="w-6 h-6 mb-2 text-orange-600" />
                <p className="text-2xl font-bold mb-1 text-orange-900">
                  <AnimatedCounter value={stats?.totalStudentsLed ?? 0} />
                </p>
                <p className="text-xs text-orange-700">Students Led</p>
              </div>
            </div>

            {/* Share QR Code */}
            {showQRCode && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
                <h3 className="font-bold text-gray-900 mb-4">Share Profile</h3>
                <div className="inline-block p-4 bg-white rounded-xl border-2 border-gray-200">
                  <QRCodeSVG
                    value={`${window.location.origin}/profile/${shareEmail || 'me'}`}
                    size={180}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-xs text-gray-500 mt-4">Scan to view profile</p>
              </div>
            )}
          </div>

          {/* Right Column - Details & Activities */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-all hover:scale-105"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={updateProfile.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-xl transition-all hover:scale-105 shadow-lg disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-sm font-medium">Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{displayName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{displayEmail}</p>
                  )}
                </div>

                {/* Campus ID */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    Campus ID
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{profile?.campusId || '—'}</p>
                </div>

                {/* Role */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    Role
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{displayRole}</p>
                </div>


              </div>
            </div>

            {/* Notification Settings Section */}
            {showNotificationSettings && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-bold text-gray-900">Notification Preferences</h3>
                </div>

                <div className="space-y-6">
                  {/* General Notifications */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">General</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                            <p className="text-xs text-gray-500">Receive notifications via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.emailNotifications}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                            <p className="text-xs text-gray-500">Receive push notifications in browser</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.pushNotifications}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, pushNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Booking Notifications */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Booking Updates</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Booking Approved</p>
                            <p className="text-xs text-gray-500">When your booking is approved</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.bookingApproved}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, bookingApproved: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <X className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Booking Rejected</p>
                            <p className="text-xs text-gray-500">When your booking is rejected</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.bookingRejected}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, bookingRejected: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Booking Reminders</p>
                            <p className="text-xs text-gray-500">Reminders before your booking starts</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.bookingReminder}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, bookingReminder: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Other Notifications */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Other Activities</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <QrCode className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">QR Session Updates</p>
                            <p className="text-xs text-gray-500">When QR sessions are created or expired</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.qrSessionCreated}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, qrSessionCreated: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Equipment Reports</p>
                            <p className="text-xs text-gray-500">Updates on equipment issues you reported</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.equipmentReports}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, equipmentReports: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">System Announcements</p>
                            <p className="text-xs text-gray-500">Important system updates and news</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationPrefs.systemAnnouncements}
                            onChange={(e) => setNotificationPrefs({ ...notificationPrefs, systemAnnouncements: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-medium shadow-lg hover:scale-105">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              </div>
              {isActivitiesDataLoading && (
                <p className="text-sm text-gray-500 mb-2">Loading activities...</p>
              )}
              <RecentActivity activities={activityItems} maxItems={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
