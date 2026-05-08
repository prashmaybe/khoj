import React from 'react';
import { View, StyleSheet } from 'react-native';
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
  searchBarRef?: React.RefObject<any>;
}

const BrowserToolbar: React.FC<BrowserToolbarProps> = React.memo(({
  url,
  onUrlChange,
  onNavigate,
  onKeyPress,
  onBack,
  onForward,
  onReload,
  onHome,
  isLoading = false,
  disabled = false,
  searchBarRef
}) => {
  return (
    <View style={styles.browserToolbar}>
      <NavigationControls
        onBack={onBack}
        onForward={onForward}
        onReload={onReload}
        onHome={onHome}
        disabled={disabled}
      />
      <SearchBar
        ref={searchBarRef}
        value={url}
        onChange={onUrlChange}
        onNavigate={onNavigate}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        disabled={disabled}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  browserToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default BrowserToolbar;
