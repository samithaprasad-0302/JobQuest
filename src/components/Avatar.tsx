import React from 'react';

type AvatarProps = {
  size?: number; // tailwind size in rem units (e.g., 8 -> w-8 h-8)
  className?: string;
  fallbackText: string; // e.g., initials
};

const sizeClass = (size?: number) => {
  if (!size) return 'w-8 h-8';
  return `w-${size} h-${size}`;
};

export const Avatar: React.FC<AvatarProps> = ({ size = 8, className = '', fallbackText }) => {
  return (
    <div className={`${sizeClass(size)} bg-blue-600 rounded-full flex items-center justify-center ${className}`}> 
      <span className="text-white text-sm font-medium">{fallbackText}</span>
    </div>
  );
};

export default Avatar;
