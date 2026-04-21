import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { BookingStatus } from '../types/booking.type';

const statusConfig = {
  All: {
    icon: AlertCircle,
    text: 'All',
    className: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  PendingApproval: {
    icon: AlertCircle,
    text: 'Pending Approval',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  Approved: {
    icon: CheckCircle,
    text: 'Approved',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  Rejected: {
    icon: XCircle,
    text: 'Rejected',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  Cancelled: {
    icon: XCircle,
    text: 'Cancelled',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
} satisfies Record<BookingStatus, { icon: typeof AlertCircle; text: string; className: string }>;

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = String(status ?? "").toUpperCase();
  
  let effectiveStatus: keyof typeof statusConfig = 'All';
  if (status === 'Approved' || s === '2' || s === 'ACCEPTED') effectiveStatus = 'Approved';
  else if (status === 'PendingApproval' || s === '1' || s === 'PENDING') effectiveStatus = 'PendingApproval';
  else if (status === 'Rejected' || s === '3') effectiveStatus = 'Rejected';
  else if (status === 'Cancelled' || s === '4') effectiveStatus = 'Cancelled';
  else if (Object.keys(statusConfig).includes(status as string)) effectiveStatus = status as keyof typeof statusConfig;

  const config = statusConfig[effectiveStatus] || statusConfig.All;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.text}
    </span>
  );
}

export function getStatusAccentClass(status: BookingStatus): string {
  const s = String(status ?? "").toUpperCase();
  if (status === 'Approved' || s === '2' || s === 'ACCEPTED') return 'bg-green-50 border-green-200 hover:border-green-300';
  if (status === 'PendingApproval' || s === '1' || s === 'PENDING') return 'bg-yellow-50 border-yellow-200 hover:border-yellow-300';
  if (status === 'All' || s === '0') return 'bg-amber-50 border-amber-200 hover:border-amber-300';
  if (status === 'Cancelled' || s === '4') return 'bg-gray-50 border-gray-200 hover:border-gray-300';
  return 'bg-red-50 border-red-200 hover:border-red-300'; // Default/Rejected
}
