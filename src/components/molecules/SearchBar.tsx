import React from 'react';
import { Input, Button, Icon } from '../atoms';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onNavigate: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onNavigate,
  onKeyPress,
  isLoading = false,
  placeholder = 'Search or type a URL',
  disabled = false
}) => {
  return (
    <div className="url-bar">
      <div className={`omnibox ${isLoading ? 'is-loading' : ''}`}>
        <Icon name="🔒" className="omnibox-lock" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          className="url-input"
          variant="url"
          disabled={disabled || isLoading}
        />
        <Button
          onClick={onNavigate}
          className="navigate-button"
          disabled={disabled || isLoading}
          aria-label="Go"
          title="Go"
        >
          {isLoading ? '⟳' : '→'}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
