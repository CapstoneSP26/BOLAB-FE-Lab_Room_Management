/**
 * ProfilePage - Enhanced User Profile with Glassmorphism
 * Premium design with animations and visual effects
 */

import React, { useState } from 'react';
import { 
  User, Mail, Phone, Briefcase, Calendar, Shield,
  Camera, Edit2, Save, X, Bell, Lock, Eye, EyeOff,
  BookOpen, QrCode, Clock,
  Download, Share2, Flame,
  ChevronRight, Check, AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { RecentActivity, type Activity } from '../components/RecentActivity';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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

  // User data - Replace with real data from context/API
  const [userData, setUserData] = useState({
    fullName: 'Nguyen Van A',
    email: 'nguyenvana@fpt.edu.vn',
    phone: '+84 123 456 789',
    role: 'Lecturer',
    department: 'Software Engineering',
    memberSince: '2020-09-01',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Passionate educator specializing in Software Engineering and AI. Committed to fostering innovation.',
  });

  // Statistics
  const stats = {
    totalBookings: 156,
    activeBookings: 3,
    qrSessionsCreated: 89,
    reportsSubmitted: 12,
    attendanceRate: 94.5,
    hoursTeaching: 1240,
    studentsImpacted: 450,
  };

  // Profile Completion
  let profileCompletion = 85; // Calculate based on filled fields

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

  // Recent activities
  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'booking',
      title: 'Booked Lab A-501',
      description: 'For Software Engineering class on Mar 10, 2026',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'qr_generated',
      title: 'Generated QR Code',
      description: 'Lab G-203 - 28 students attended',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'report_sent',
      title: 'Reported Equipment Issue',
      description: 'Projector malfunction in Lab D-305',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'booking_approved',
      title: 'Booking Approved',
      description: 'Lab A-101 for Database Management',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportProfile = () => {
    alert('📄 Export to PDF - Coming soon!');
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
                  {/* Avatar with Completion Ring */}
                  <div className="relative inline-block mb-6">
                    {/* Completion Ring */}
                    <svg className="absolute -inset-2 w-36 h-36" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - profileCompletion / 100)}`}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <img
                      src={userData.avatar}
                      alt={userData.fullName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                    />
                    <label className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{userData.fullName}</h2>
                  <p className="text-orange-600 font-semibold mb-1">{userData.role}</p>
                  <p className="text-sm text-gray-600 mb-4">{userData.department}</p>

                  {/* Profile Completion Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full mb-4">
                    <div className="flex items-center gap-1">
                      {profileCompletion === 100 ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        <AnimatedCounter value={profileCompletion} suffix="%" /> Complete
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {userData.bio}
                  </p>

                  {/* Member Since */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {new Date(userData.memberSince).getFullYear()}</span>
                  </div>
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
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" />
                      <span className="text-gray-700 font-medium">Change Password</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-blue-200">
                <BookOpen className="w-6 h-6 mb-2 text-blue-600" />
                <p className="text-2xl font-bold mb-1 text-blue-900">
                  <AnimatedCounter value={stats.totalBookings} />
                </p>
                <p className="text-xs text-blue-700">Total Bookings</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-green-200">
                <QrCode className="w-6 h-6 mb-2 text-green-600" />
                <p className="text-2xl font-bold mb-1 text-green-900">
                  <AnimatedCounter value={stats.qrSessionsCreated} />
                </p>
                <p className="text-xs text-green-700">QR Sessions</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-purple-200">
                <Clock className="w-6 h-6 mb-2 text-purple-600" />
                <p className="text-2xl font-bold mb-1 text-purple-900">
                  <AnimatedCounter value={stats.hoursTeaching} />
                </p>
                <p className="text-xs text-purple-700">Hours Teaching</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-4 shadow-md hover:scale-105 transition-transform cursor-pointer border border-orange-200">
                <User className="w-6 h-6 mb-2 text-orange-600" />
                <p className="text-2xl font-bold mb-1 text-orange-900">
                  <AnimatedCounter value={stats.studentsImpacted} />
                </p>
                <p className="text-xs text-orange-700">Students</p>
              </div>
            </div>

            {/* Share QR Code */}
            {showQRCode && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
                <h3 className="font-bold text-gray-900 mb-4">Share Profile</h3>
                <div className="inline-block p-4 bg-white rounded-xl border-2 border-gray-200">
                  <QRCodeSVG
                    value={`${window.location.origin}/profile/${userData.email}`}
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
            {/* Activity Heatmap */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900">Activity Overview</h3>
                <span className="ml-auto text-sm text-gray-500">Last 12 weeks</span>
              </div>

              <div className="flex gap-1 overflow-x-auto pb-2">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.count)} transition-all hover:scale-150 cursor-pointer`}
                        title={`${day.date.toLocaleDateString()}: ${day.count} activities`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-100" />
                  <div className="w-3 h-3 rounded-sm bg-green-200" />
                  <div className="w-3 h-3 rounded-sm bg-green-300" />
                  <div className="w-3 h-3 rounded-sm bg-green-400" />
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <div className="w-3 h-3 rounded-sm bg-green-600" />
                </div>
                <span>More</span>
              </div>
            </div>

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
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-xl transition-all hover:scale-105 shadow-lg"
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
                      value={userData.fullName}
                      onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{userData.fullName}</p>
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
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{userData.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{userData.phone}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    Role
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{userData.role}</p>
                </div>

                {/* Department */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.department}
                      onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  ) : (
                    <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{userData.department}</p>
                  )}
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

            {/* Change Password Section */}
            {showPasswordChange && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="Enter new password"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all font-medium shadow-lg hover:scale-105">
                    Update Password
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
              <RecentActivity activities={recentActivities} maxItems={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
