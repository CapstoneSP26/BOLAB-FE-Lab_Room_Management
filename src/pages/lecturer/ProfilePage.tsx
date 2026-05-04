/**
 * ProfilePage - Enhanced User Profile with Glassmorphism
 * Premium design with animations and visual effects
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  User, Mail, Briefcase, Shield, Bell,
  BookOpen, Clock,
  ChevronRight, Check, X
} from 'lucide-react';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { RecentActivity, type Activity } from '../../components/common/RecentActivity';
import {
  useMyProfile,
  useProfileStats,
  useRecentActivities,
} from '../../features/profile/hooks/userProfile';
import { useNotificationPreferences } from '../../features/profile/hooks/useNotificationPreferences';
import { RoleSwitcher } from '../../features/profile/components/RoleSwitcher';
import { addCacheBuster } from '../../utils/imageCache';

export default function ProfilePage() {
  const location = useLocation();
  const notificationSectionRef = useRef<HTMLDivElement>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const {
    notificationPrefs,
    updateNotificationPref,
    isSavingPreferences,
    saveError,
    saveSuccess,
    saveNotificationPreferences,
  } = useNotificationPreferences({
    initialPreferences: profile?.notificationPreferences ?? null,
  });
  const { data: stats, isLoading: isStatsLoading } = useProfileStats();
  const { data: recentActivitiesData, isLoading: isActivitiesLoading } =
    useRecentActivities(10);

  const isProfileDataLoading = isProfileLoading && !profile;
  const isStatsDataLoading = isStatsLoading && !stats;
  const isActivitiesDataLoading = isActivitiesLoading && !recentActivitiesData;


  const avatarUrl = useMemo(
    () =>
      addCacheBuster(
        profile?.avatarUrl ||
          profile?.userImageUrl ||
          '/images/user/default-avatar.png',
      ),
    [profile],
  );

  const displayName = profile?.fullName || '—';
  const displayEmail = profile?.email || '—';
  const displayRole = profile?.role || '—';

  const campusNameById: Record<number, string> = {
    1: 'Đà Nẵng',
    2: 'Hà Nội',
    3: 'TP.HCM',
    4: 'Quy Nhơn',
    5: 'Cần Thơ',
  };

  const displayCampusName =
    profile?.campusId != null
      ? (campusNameById[profile.campusId] ?? `Campus ${profile.campusId}`)
      : '—';

  useEffect(() => {
    const shouldOpenNotifications = Boolean(
      location.state && typeof location.state === 'object' && (location.state as { openNotifications?: boolean }).openNotifications,
    );

    if (shouldOpenNotifications) {
      setShowNotificationSettings(true);
      window.history.replaceState({}, document.title);
      requestAnimationFrame(() => {
        notificationSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [location.state]);

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account and view your achievements</p>
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
                  <p className="text-orange-600 font-semibold">{displayRole}</p>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isStatsDataLoading && (
                <div className="md:col-span-2 text-xs text-gray-500">
                  Loading statistics...
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-5 shadow-md hover:scale-[1.02] transition-transform cursor-pointer border border-blue-200 min-h-[120px] flex flex-col justify-between">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-3xl font-bold mb-1 text-blue-900">
                    <AnimatedCounter value={stats?.totalBookings ?? 0} />
                  </p>
                  <p className="text-sm text-blue-700 font-medium">Total Bookings</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-5 shadow-md hover:scale-[1.02] transition-transform cursor-pointer border border-purple-200 min-h-[120px] flex flex-col justify-between">
                <Clock className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-3xl font-bold mb-1 text-purple-900">
                    <AnimatedCounter value={stats?.totalHoursTaught ?? 0} />
                  </p>
                  <p className="text-sm text-purple-700 font-medium">Hours Taught</p>
                </div>
              </div>
            </div>

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{displayName}</p>
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{displayEmail}</p>
                </div>

                {/* Campus Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    Campus
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{displayCampusName}</p>
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

            {/* Role Switcher Section */}
            <RoleSwitcher />

            {/* Notification Settings Section */}
            {showNotificationSettings && (
              <div ref={notificationSectionRef} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
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
                            onChange={(e) => updateNotificationPref('emailNotifications', e.target.checked)}
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
                            onChange={(e) => updateNotificationPref('pushNotifications', e.target.checked)}
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
                            onChange={(e) => updateNotificationPref('bookingApproved', e.target.checked)}
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
                            onChange={(e) => updateNotificationPref('bookingRejected', e.target.checked)}
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
                            onChange={(e) => updateNotificationPref('bookingReminder', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  

                  {saveError && (
                    <p className="text-sm text-red-600">{saveError}</p>
                  )}

                  {saveSuccess && (
                    <p className="text-sm text-green-600">{saveSuccess}</p>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await saveNotificationPreferences();
                      } catch {
                        // error state handled inside hook
                      }
                    }}
                    disabled={isSavingPreferences}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-medium shadow-lg hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
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
