import React from 'react';

export interface ScrollbarProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const Scrollbar: React.FC<ScrollbarProps> = ({
  children,
  className = '',
  maxHeight,
  width = '100%',
  height = '100%',
  orientation = 'vertical',
}) => {
  const overflowX = orientation === 'horizontal' || orientation === 'both' ? 'auto' : 'hidden';
  const overflowY = orientation === 'vertical' || orientation === 'both' ? 'auto' : 'hidden';

  return (
    <div
      className={`custom-scrollbar ${className}`}
      style={{
        width,
        height,
        maxHeight,
        overflowX,
        overflowY,
      }}
    >
      {children}
    </div>
  );
};

export default Scrollbar;
