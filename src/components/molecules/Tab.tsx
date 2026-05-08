import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  const handlePress = () => {
    onClick();
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.tabActive]}
      onPress={handlePress}
    >
      <View style={styles.tabFavicon}>
        {faviconUrl ? (
          <Image source={{ uri: faviconUrl }} style={styles.faviconImage} />
        ) : (
          <View style={styles.tabFaviconFallback} />
        )}
      </View>
      <Text style={styles.tabTitle} numberOfLines={1}>{title}</Text>
      {showCloseButton && (
        <TouchableOpacity
          onPress={handleClose}
          style={styles.tabClose}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    minWidth: 140,
    maxWidth: 240,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  tabActive: {
    backgroundColor: '#f8f9fa',
    borderColor: 'rgba(0, 0, 0, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  tabTitle: {
    flex: 1,
    fontSize: 12.5,
    color: 'rgba(0, 0, 0, 0.78)',
    lineHeight: 16,
  },
  tabClose: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 14,
    padding: 0,
    marginLeft: 2,
    color: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
});

export default Tab;
