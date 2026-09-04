import React from 'react';

interface MonkyLogoProps {
  className?: string;
  showText?: boolean;
  textSize?: string;
  size?: number;
  height?: number;
}

export const MonkyPinIcon: React.FC<{ className?: string; scale?: number; size?: number }> = ({
  className = '',
  size = 42,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      <img
        src="/logoo-transparent.png"
        alt="Tevinde.ro"
        style={{ height: `${size}px` }}
        className="w-auto object-contain pointer-events-none group-hover:scale-105 transition-transform duration-200"
      />
    </div>
  );
};

export const MonkyLogo: React.FC<MonkyLogoProps> = ({
  className = '',
  height = 46,
}) => {
  return (
    <div className={`flex items-center select-none group ${className}`}>
      {/* Light Mode: dark navy text with turquoise accent */}
      <img
        src="/logoo-transparent.png"
        alt="Tevinde.ro"
        style={{ height: `${height}px` }}
        className="dark:hidden h-auto w-auto max-h-[58px] object-contain pointer-events-none group-hover:opacity-95 transition-opacity"
      />
      {/* Dark Mode: crisp white text with turquoise accent */}
      <img
        src="/logoo-white.png"
        alt="Tevinde.ro"
        style={{ height: `${height}px` }}
        className="hidden dark:block h-auto w-auto max-h-[58px] object-contain pointer-events-none group-hover:opacity-95 transition-opacity"
      />
    </div>
  );
};

export default MonkyLogo;
