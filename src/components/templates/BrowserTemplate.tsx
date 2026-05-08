import React from 'react';
import { Browser } from '../organisms';

interface BrowserTemplateProps {
  children?: React.ReactNode;
}

const BrowserTemplate: React.FC<BrowserTemplateProps> = ({ children }) => {
  return (
    <div className="browser-template">
      {children}
    </div>
  );
};

export default BrowserTemplate;
