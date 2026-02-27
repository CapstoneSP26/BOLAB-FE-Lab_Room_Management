import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface GlassmorphismStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  description?: string;
}

export const GlassmorphismStatCard: React.FC<GlassmorphismStatCardProps> = ({
  title,
  value,
  icon: Icon,
  gradient,
  description,
}) => {
  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-30 
                      group-hover:opacity-50 transition-opacity duration-500`}></div>
      
      {/* Card */}
      <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl p-6 
                    border border-white/50 shadow-2xl hover:shadow-3xl
                    transition-all duration-500 hover:scale-105 hover:-translate-y-1">
        {/* Icon Background */}
        <div className="absolute top-4 right-4 opacity-10">
          <Icon className="h-20 w-20" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-3">
          {/* Icon */}
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            {title}
          </h3>

          {/* Value */}
          <div className="flex items-baseline gap-2">
            <p className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Animated Border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      animate-shimmer"></div>
      </div>
    </div>
  );
};

export default GlassmorphismStatCard;
