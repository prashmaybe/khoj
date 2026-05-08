import React from 'react';
import { Button } from '../atoms';
import { Icon } from '../atoms';

interface TabProps {
  id: string;
  title: string;
  faviconUrl?: string | null;
  isActive?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const Tab: React.FC<TabProps> = ({
  id,
  title,
  faviconUrl,
  isActive = false,
  isLoading = false,
  onClick,
  onClose,
  showCloseButton = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  return (
    <div
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <span className="tab-favicon" aria-hidden="true">
        {faviconUrl ? (
          <img src={faviconUrl} alt="" />
        ) : (
          <span className="tab-favicon-fallback" />
        )}
      </span>
      <span className="tab-title">{title}</span>
      {showCloseButton && (
        <Button
          className="tab-close"
          onClick={handleClose}
          aria-label="Close tab"
        >
          ×
        </Button>
      )}
    </div>
  );
};

export default Tab;
