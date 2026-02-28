import React from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, colorClass }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-gray-100 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
  {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
    className: `h-6 w-6 ${colorClass.replace('bg-', 'text-')}` 
  })}
</div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${
              trend.isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
            }`}>
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;