import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  IoAdd,
  IoArrowBack,
  IoArrowForward,
  IoCopyOutline,
  IoChevronDown,
  IoClose,
  IoEllipsisHorizontal,
  IoFolderOpenOutline,
  IoGlobeOutline,
  IoHomeOutline,
  IoLaptopOutline,
  IoOpenOutline,
  IoPencilOutline,
  IoReaderOutline,
  IoLockClosedOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoTrashOutline,
} from 'react-icons/io5';

interface IconProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

const Icon: React.FC<IconProps> = React.memo(({ name, size = 'medium', style }) => {
  const { colors } = useTheme();

  const isWeb = typeof document !== 'undefined';

  const px = size === 'small' ? 16 : size === 'large' ? 22 : 18;

  const webIconStyle: React.CSSProperties = {
    width: px,
    height: px,
    color: colors.text,
    flex: '0 0 auto',
    display: 'block',
  };

  const pick = () => {
    switch (name) {
      case 'add':
        return <IoAdd style={webIconStyle} />;
      case 'arrow-back':
        return <IoArrowBack style={webIconStyle} />;
      case 'arrow-forward':
        return <IoArrowForward style={webIconStyle} />;
      case 'copy':
        return <IoCopyOutline style={webIconStyle} />;
      case 'chevron-down':
        return <IoChevronDown style={webIconStyle} />;
      case 'close':
        return <IoClose style={webIconStyle} />;
      case 'ellipsis':
        return <IoEllipsisHorizontal style={webIconStyle} />;
      case 'folder':
        return <IoFolderOpenOutline style={webIconStyle} />;
      case 'globe':
        return <IoGlobeOutline style={webIconStyle} />;
      case 'home':
        return <IoHomeOutline style={webIconStyle} />;
      case 'laptop':
        return <IoLaptopOutline style={webIconStyle} />;
      case 'lock':
        return <IoLockClosedOutline style={webIconStyle} />;
      case 'open':
        return <IoOpenOutline style={webIconStyle} />;
      case 'pencil':
        return <IoPencilOutline style={webIconStyle} />;
      case 'reader':
        return <IoReaderOutline style={webIconStyle} />;
      case 'refresh':
        return <IoRefreshOutline style={webIconStyle} />;
      case 'search':
        return <IoSearchOutline style={webIconStyle} />;
      case 'trash':
        return <IoTrashOutline style={webIconStyle} />;
      default:
        return null;
    }
  };

  const getIconStyle = () => {
    const baseStyle = [styles.icon, { color: colors.text }];
    
    const sizeStyles = {
      small: styles.iconSmall,
      medium: styles.iconMedium,
      large: styles.iconLarge
    };
    
    return [
      baseStyle,
      sizeStyles[size],
      style
    ];
  };

  if (isWeb) {
    const node = pick();
    if (node) {
      return <View style={[styles.webWrap, style]}>{node as any}</View>;
    }
  }

  // Fallback (native or unknown icon name)
  return <Text style={getIconStyle()}>{name}</Text>;
});

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
  webWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: {
    fontSize: 12,
  },
  iconMedium: {
    fontSize: 14,
  },
  iconLarge: {
    fontSize: 18,
  },
});

export default Icon;
