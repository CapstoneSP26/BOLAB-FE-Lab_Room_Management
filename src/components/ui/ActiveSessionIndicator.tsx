/**
 * ActiveSessionIndicator Component
 * Shows active QR attendance sessions in header
 */

import React, { useEffect, useState } from 'react';
import { QrCode, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActiveSession {
  id: string;
  roomName: string;
  expiresAt: string;
  attendeeCount: number;
}

interface ActiveSessionIndicatorProps {
  sessions?: ActiveSession[];
}

export const ActiveSessionIndicator: React.FC<ActiveSessionIndicatorProps> = ({ 
  sessions = [] 
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  useEffect(() => {
    if (sessions.length === 0) return;

    const interval = setInterval(() => {
      const newTimeLeft: Record<string, number> = {};
      
      sessions.forEach((session) => {
        const expiryTime = new Date(session.expiresAt).getTime();
        const now = Date.now();
        const diff = Math.max(0, expiryTime - now);
        newTimeLeft[session.id] = diff;
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions]);

  if (sessions.length === 0) {
    return null;
  }

  // Filter out expired sessions (timeLeft <= 0)
  const activeSessions = sessions.filter((session) => {
    const time = timeLeft[session.id];
    return time === undefined || time > 0;
  });

  if (activeSessions.length === 0) {
    return null;
  }

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {activeSessions.map((session) => {
        const time = timeLeft[session.id] || 0;
        const isExpiringSoon = time < 60000; // Less than 1 minute

        return (
          <button
            key={session.id}
            onClick={() => navigate(`/qr-display/${session.id}`)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg
              border-2 transition-all hover:scale-105
              ${
                isExpiringSoon
                  ? 'bg-red-50 border-red-300 text-red-700 animate-badge-pulse'
                  : 'bg-green-50 border-green-300 text-green-700'
              }
            `}
            title={`Click to view QR code for ${session.roomName}`}
          >
            <QrCode className="w-4 h-4" />
            <div className="text-xs font-medium">
              <div className="font-semibold">{session.roomName}</div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(time)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
