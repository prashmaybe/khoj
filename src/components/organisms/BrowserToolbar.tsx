import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useMolecules } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

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
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
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
  searchBarRef,
  isBookmarked = false,
  onBookmarkToggle,
}) => {
  const { colors } = useTheme();
  const { NavigationControls, SearchBar } = useMolecules();

  return (
    <View style={[styles.browserToolbar, { backgroundColor: colors.toolbar, borderBottomColor: colors.border }]}>
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
        isBookmarked={isBookmarked}
        onBookmarkToggle={onBookmarkToggle}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  browserToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
});

export default BrowserToolbar;
