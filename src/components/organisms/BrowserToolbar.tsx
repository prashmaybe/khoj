import React from 'react';
import { NavigationControls, SearchBar } from '../molecules';

interface BrowserToolbarProps {
  url: string;
  onUrlChange: (url: string) => void;
  onNavigate: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const BrowserToolbar: React.FC<BrowserToolbarProps> = ({
  url,
  onUrlChange,
  onNavigate,
  onKeyPress,
  onBack,
  onForward,
  onReload,
  onHome,
  isLoading = false,
  disabled = false
}) => {
  return (
    <div className="browser-toolbar">
      <NavigationControls
        onBack={onBack}
        onForward={onForward}
        onReload={onReload}
        onHome={onHome}
        disabled={disabled}
      />
      <SearchBar
        value={url}
        onChange={onUrlChange}
        onNavigate={onNavigate}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        disabled={disabled}
      />
    </div>
  );
};

export default BrowserToolbar;
