import {type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div
      className={`
        border-2 border-tactical-green/30 bg-bg-secondary rounded p-6
        ${glow ? 'border-glow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}