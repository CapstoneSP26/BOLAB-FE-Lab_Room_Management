/**
 * LoadingFallback Component
 * Better loading UI for Suspense fallback
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
          <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Loading...
        </h2>
        <p className="text-sm text-gray-600">
          Please wait while we load the page
        </p>
      </div>
    </div>
  );
};
