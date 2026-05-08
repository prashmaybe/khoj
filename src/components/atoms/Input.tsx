import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'url' | 'search';
  inputSize?: 'small' | 'medium' | 'large';
}

const Input: React.FC<InputProps> = ({ 
  variant = 'default', 
  inputSize = 'medium', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'input';
  const variantClasses = {
    default: 'input-default',
    url: 'url-input',
    search: 'search-input'
  };
  const sizeClasses = {
    small: 'input-small',
    medium: 'input-medium',
    large: 'input-large'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[inputSize],
    className
  ].filter(Boolean).join(' ');

  return (
    <input className={classes} {...props} />
  );
};

export default Input;
