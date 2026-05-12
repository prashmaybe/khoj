import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = React.memo(({ 
  text, 
  children, 
  position = 'top'
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return {
          bottom: 8,
          left: '50%',
          transform: [{ translateX: -50 }],
        };
      case 'bottom':
        return {
          top: 8,
          left: '50%',
          transform: [{ translateX: -50 }],
        };
      case 'left':
        return {
          right: 8,
          top: '50%',
          transform: [{ translateY: -12 }],
        };
      case 'right':
        return {
          left: 8,
          top: '50%',
          transform: [{ translateY: -12 }],
        };
      default:
        return {
          bottom: 8,
          left: '50%',
          transform: [{ translateX: -50 }],
        };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {children}
      </View>
      {isVisible && (
        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              ...getPositionStyle(),
            },
          ]}
        >
          <Text
            style={[
              styles.tooltipText,
              {
                color: colors.text,
                fontSize: colors.fontSize.xs,
                fontFamily: colors.fontFamily,
              },
            ]}
          >
            {text}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  wrapper: {
    position: 'relative',
  },
  tooltip: {
    position: 'absolute',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 200,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default Tooltip;
