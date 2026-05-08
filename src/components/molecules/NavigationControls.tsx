import React from 'react';
import { View, StyleSheet } from 'react-native';
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
      <View style={styles.navigationControls}>
        <Button
          onPress={onBack}
          variant="nav"
          size="medium"
          disabled={disabled}
        >
          <Icon name="←" />
        </Button>
        <Button
          onPress={onForward}
          variant="nav"
          size="medium"
          disabled={disabled}
        >
          <Icon name="→" />
        </Button>
        <Button
          onPress={onReload}
          variant="nav"
          size="medium"
          disabled={disabled}
        >
          <Icon name="↻" />
        </Button>
      </View>
      <Button
        onPress={onHome}
        variant="nav"
        size="medium"
        disabled={disabled}
        style={styles.homeButton}
      >
        <Icon name="⌂" />
      </Button>
    </>
  );
};

const styles = StyleSheet.create({
  navigationControls: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 4,
  },
  homeButton: {
    marginLeft: -4,
  },
});

export default NavigationControls;
