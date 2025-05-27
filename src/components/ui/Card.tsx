import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'hoverable' | 'glass';
}

const Card: React.FC<CardProps> = ({ 
  className, 
  children, 
  variant = 'default' 
}) => {
  const variantStyles: Record<string, string> = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    hoverable: 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200',
    glass: 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-md border border-white/20 dark:border-gray-700/20',
  };

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div className={cn('p-5 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return (
    <h3 className={cn('text-lg font-medium text-gray-900 dark:text-gray-100', className)}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({ className, children }) => {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400', className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return <div className={cn('p-5', className)}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return (
    <div className={cn('p-5 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };