'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';

export default function ResizableContainer({
  children,
  initialHeight,
}: {
  children: React.ReactNode;
  initialHeight?: number;
}) {
  const [height, setHeight] = useState(initialHeight ?? 300); // Initial height in pixels
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Handle mouse down on the resize handle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
  };

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - startYRef.current;
      const newHeight = Math.max(100, startHeightRef.current + deltaY); // Minimum height of 100px
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="w-full relative">
      <div
        ref={containerRef}
        className="bg-white"
        style={{ height: `${height}px` }}>
        {/* Scrollable content area */}
        <div className="overflow-y-auto w-full h-[calc(100%-64px)]">
          <div className="p-4">{children}</div>
        </div>

        {/* Resize handle */}
        <div
          className={`h-4 border-t border-gray-200 bg-gray-50 cursor-ns-resize flex items-center justify-center ${isDragging ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          onMouseDown={handleMouseDown}>
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}
