import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMolecules } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import Menu, { MenuItem } from '../molecules/Menu';

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
  onPasswordManager?: () => void;
  onNewTab?: () => void;
  onNewWindow?: () => void;
  onExit?: () => void;
  onNavigateToPage?: (page: string) => void;
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
  onPasswordManager,
  onNewTab,
  onNewWindow,
  onExit,
  onNavigateToPage,
}) => {
  const { colors } = useTheme();
  const { NavigationControls, SearchBar, PasswordManagerButton, MenuButton } = useMolecules();
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<View>(null);

  const getMenuItems = (): MenuItem[] => [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      onPress: () => onNavigateToPage?.('khoj://'),
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: 'folder',
      onPress: () => onNavigateToPage?.('khoj://downloads'),
    },
    {
      id: 'history',
      label: 'History',
      icon: 'reader',
      onPress: () => onNavigateToPage?.('khoj://history'),
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: 'bookmark',
      onPress: () => onNavigateToPage?.('khoj://bookmarks'),
    },
    { id: 'separator1', separator: true },
    {
      id: 'new-tab',
      label: 'New Tab',
      icon: 'add',
      onPress: () => onNewTab?.(),
    },
    {
      id: 'new-window',
      label: 'New Window',
      icon: 'open',
      onPress: () => onNewWindow?.(),
    },
    { id: 'separator2', separator: true },
    {
      id: 'exit',
      label: 'Exit',
      icon: 'close',
      onPress: () => onExit?.(),
    },
  ];

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
      {onPasswordManager && (
        <PasswordManagerButton
          currentUrl={url}
          onPress={onPasswordManager}
          style={styles.passwordManagerButton}
        />
      )}
      <MenuButton
        onPress={() => setShowMenu(true)}
        style={styles.menuButton}
      />
      <Menu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        items={getMenuItems()}
        anchorPosition={{ x: 8, y: 60 }}
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
  passwordManagerButton: {
    marginLeft: 8,
  },
  menuButton: {
    marginLeft: 8,
  },
});

export default BrowserToolbar;
