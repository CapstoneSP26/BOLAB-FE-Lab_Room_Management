/**
 * QuickActionFAB Component
 * Floating Action Button with expandable menu
 */

import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, Calendar, QrCode, FileText } from 'lucide-react';
import { SendReportModal } from '../../features/reports/components/SendReportModal';

export const QuickActionFAB: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fabRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const hiddenPaths = ['/login'];
  const isLabManagerPage = location.pathname.startsWith('/labmanager');
  const isStudentPage = location.pathname.startsWith('/student');
  const isHiddenPath = hiddenPaths.includes(location.pathname);

  // Lecturer routes are only shown when not in labmanager/student pages
  if (isLabManagerPage || isStudentPage || isHiddenPath) {
    return null;
  }

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const actions = [
    {
      icon: Calendar,
      label: 'Quick Book',
      color: 'from-blue-500 to-indigo-500',
      action: () => {
        navigate('/book-room');
        setIsOpen(false);
      },
    },
    {
      icon: QrCode,
      label: 'Generate QR',
      color: 'from-green-500 to-emerald-500',
      action: () => {
        navigate('/attendance');
        setIsOpen(false);
      },
    },
    {
      icon: FileText,
      label: 'Send Report',
      color: 'from-purple-500 to-pink-500',
      action: () => {
        setIsReportModalOpen(true);
        setIsOpen(false);
      },
    },
  ];

  return (
    <div ref={fabRef} className="fixed bottom-6 right-6 z-[9998]">
      {/* Action Items */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        {actions.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              style={{ transitionDelay: `${index * 50}ms` }}
              className={`
                flex items-center gap-3 group
                transition-all duration-300
                ${isOpen ? 'translate-x-0' : 'translate-x-20'}
              `}
            >
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
              <div
                className={`
                  w-12 h-12 rounded-full
                  bg-gradient-to-br ${item.color}
                  flex items-center justify-center
                  text-white shadow-lg
                  hover:scale-110 transition-transform
                `}
              >
                <Icon className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full
          bg-gradient-to-br from-orange-500 to-red-500
          flex items-center justify-center
          text-white shadow-2xl
          hover:scale-110 active:scale-95
          transition-all duration-300
          ${isOpen ? 'rotate-45' : 'rotate-0'}
        `}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Send Report Modal */}
      <SendReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
