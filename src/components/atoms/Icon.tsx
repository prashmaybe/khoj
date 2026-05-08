import React from 'react';

interface IconProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 'medium', className = '' }) => {
  const baseClasses = 'icon';
  const sizeClasses = {
    small: 'icon-small',
    medium: 'icon-medium',
    large: 'icon-large'
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return <span className={classes} aria-hidden="true">{name}</span>;
};

export default Icon;
