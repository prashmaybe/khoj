import React from 'react';
import { Button } from '../atoms';
import { Icon } from '../atoms';

interface NavigationControlsProps {
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  disabled?: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onBack,
  onForward,
  onReload,
  onHome,
  disabled = false
}) => {
  return (
    <>
      <div className="navigation-controls">
        <Button
          onClick={onBack}
          className="nav-button"
          title="Back"
          aria-label="Back"
          disabled={disabled}
        >
          <Icon name="←" />
        </Button>
        <Button
          onClick={onForward}
          className="nav-button"
          title="Forward"
          aria-label="Forward"
          disabled={disabled}
        >
          <Icon name="→" />
        </Button>
        <Button
          onClick={onReload}
          className="nav-button"
          title="Reload"
          aria-label="Reload"
          disabled={disabled}
        >
          <Icon name="↻" />
        </Button>
      </div>
      <Button
        onClick={onHome}
        className="nav-button home-button"
        title="Home"
        aria-label="Home"
        disabled={disabled}
      >
        <Icon name="⌂" />
      </Button>
    </>
  );
};

export default NavigationControls;
