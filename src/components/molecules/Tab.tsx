import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Button } from '../atoms';
import { Icon } from '../atoms';
import { useTheme } from '../../contexts/ThemeContext';

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

const Tab: React.FC<TabProps> = React.memo(({
  id,
  title,
  faviconUrl,
  isActive = false,
  isLoading = false,
  onClick,
  onClose,
  showCloseButton = false
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    onClick();
  };

  const handleClose = () => {
    onClose?.();
  };

  const getTabStyle = () => [
    styles.tab,
    {
      backgroundColor: isActive ? colors.activeTab : colors.inactiveTab,
      borderColor: colors.borderSecondary,
      shadowColor: colors.shadow,
    }
  ];

  const getTitleStyle = () => [
    styles.tabTitle,
    { color: colors.text }
  ];

  const getCloseStyle = () => [
    styles.tabClose,
    { backgroundColor: 'transparent', color: colors.textSecondary }
  ];

  return (
    <TouchableOpacity
      style={getTabStyle()}
      onPress={handlePress}
    >
      <View style={styles.tabFavicon}>
        {faviconUrl ? (
          <Image source={{ uri: faviconUrl }} style={styles.faviconImage} />
        ) : (
          <View style={[styles.tabFaviconFallback, { backgroundColor: colors.textTertiary }]} />
        )}
      </View>
      <Text style={getTitleStyle()} numberOfLines={1}>{title}</Text>
      {showCloseButton && (
        <TouchableOpacity
          onPress={handleClose}
          style={getCloseStyle()}
        >
          <Text style={[styles.closeText, { color: colors.textSecondary }]}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    minWidth: 140,
    maxWidth: 240,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  tabFavicon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 4,
    overflow: 'hidden',
  },
  faviconImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  tabFaviconFallback: {
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  tabTitle: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 16,
  },
  tabClose: {
    borderWidth: 0,
    fontSize: 14,
    padding: 0,
    marginLeft: 2,
    borderRadius: 50,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
  },
});

export default Tab;
