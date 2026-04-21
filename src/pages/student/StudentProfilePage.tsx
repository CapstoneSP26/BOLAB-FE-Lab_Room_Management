/**
 * StudentProfilePage - Student Profile View
 * Display student information, statistics, and account settings
 * Uses real APIs from backend ProfileController
 */

import {
  User, Mail, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useProfile,
} from '../../features/profile';

export default function StudentProfilePage() {
  const { user } = useAuthStore();

  // API calls
  const { data: profileData, isLoading: profileLoading } = useProfile();
  
  // Use profile data or fallback
  const userData = (profileData || {
    id: user?.id || '',
    fullName: (profileData as any)?.fullName || 'Student',
    email: (profileData as any)?.email || '',
    userImageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    userCode: '',
  }) as any;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
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
                    <p className="text-gray-900 dark:text-white">{userData.fullName}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">{userData.email}</p>
                  </div>


                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-6">
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
