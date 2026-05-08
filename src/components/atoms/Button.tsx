import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'nav';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseClasses = 'button';
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    nav: 'nav-button'
  };
  const sizeClasses = {
    small: 'button-small',
    medium: 'button-medium',
    large: 'button-large'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
