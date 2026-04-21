import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const DefaultUserIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
    <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default DefaultUserIcon;