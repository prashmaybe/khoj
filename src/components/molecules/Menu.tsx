import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../atoms/Icon';

export interface MenuItem {
  id: string;
  label?: string;
  icon?: string;
  onPress?: () => void;
  separator?: boolean;
}

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  anchorPosition?: { x: number; y: number };
}

const Menu: React.FC<MenuProps> = React.memo(({ visible, onClose, items, anchorPosition }) => {
  const { colors } = useTheme();
  const [animation] = useState(new Animated.Value(0));
  const menuRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current) {
        const rect = (menuRef.current as any).getBoundingClientRect?.();
        if (rect) {
          const isInMenu = event.clientX >= rect.left && event.clientX <= rect.right &&
                          event.clientY >= rect.top && event.clientY <= rect.bottom;
          if (!isInMenu) {
            onClose();
          }
        }
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const menuStyle = [
    styles.menu,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      opacity: animation,
      transform: [
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
      position: 'absolute' as const,
      right: anchorPosition?.x || 0,
      top: anchorPosition?.y || 0,
      zIndex: 999999,
      elevation: 25,
    },
  ];

  return (
    <>
      <View style={[styles.overlay, { 
        position: 'absolute' as const, 
        zIndex: 99999,
        backgroundColor: 'transparent'
      }]}>
        <Animated.View style={[menuStyle, { 
          zIndex: 100000,
          elevation: 20
        }]} ref={menuRef}>
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <View
                  key={`separator-${index}`}
                  style={[styles.separator, { backgroundColor: colors.border }]}
                />
              );
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { backgroundColor: 'transparent' }]}
                onPress={() => {
                  item.onPress?.();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                {item.icon && (
                  <Icon name={item.icon} size="small" style={styles.menuItemIcon} />
                )}
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color: colors.text,
                      fontSize: colors.fontSize.sm,
                      fontFamily: colors.fontFamily,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999999,
    pointerEvents: 'none' as const,
  },
  menu: {
    position: 'absolute' as const,
    minWidth: 200,
    maxWidth: 300,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    pointerEvents: 'auto',
    zIndex: 9999999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  menuItemIcon: {
    marginRight: 8,
    width: 16,
    height: 16,
  },
  menuItemText: {
    flex: 1,
    fontWeight: '400',
  },
  separator: {
    height: 1,
    marginHorizontal: 8,
    marginVertical: 4,
  },
});

export default Menu;
