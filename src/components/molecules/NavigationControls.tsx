import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAtoms } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { Tooltip } from '../atoms';

interface NavigationControlsProps {
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  disabled?: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = React.memo(({
  onBack,
  onForward,
  onReload,
  onHome,
  disabled = false
}) => {
  const { Button, Icon, ThemeToggle } = useAtoms();
  const { isIncognito, setIncognito, colors } = useTheme();
  return (
    <>
      <View style={styles.navigationControls}>
        <Tooltip text="Back">
          <Button
            onPress={onBack}
            variant="nav"
            size="medium"
            disabled={disabled}
          >
            <Icon name="arrow-back" />
          </Button>
        </Tooltip>
        <Tooltip text="Forward">
          <Button
            onPress={onForward}
            variant="nav"
            size="medium"
            disabled={disabled}
          >
            <Icon name="arrow-forward" />
          </Button>
        </Tooltip>
        <Tooltip text="Reload">
          <Button
            onPress={onReload}
            variant="nav"
            size="medium"
            disabled={disabled}
          >
            <Icon name="refresh" />
          </Button>
        </Tooltip>
      </View>
      <Tooltip text="Home">
        <Button
          onPress={onHome}
          variant="nav"
          size="medium"
          disabled={disabled}
          style={styles.homeButton}
        >
          <Icon name="home" />
        </Button>
      </Tooltip>
      <Tooltip text={isIncognito ? "Exit Incognito" : "Incognito Mode"}>
        <Button
          onPress={() => setIncognito(!isIncognito)}
          variant="nav"
          size="medium"
          style={{
            marginLeft: -4,
            backgroundColor: isIncognito ? colors.buttonPrimary : undefined
          }}
        >
          <Icon name="incognito" />
        </Button>
      </Tooltip>
      <Tooltip text="Toggle Theme">
        <ThemeToggle style={styles.themeToggle} />
      </Tooltip>
    </>
  );
});

const styles = StyleSheet.create({
  navigationControls: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 4,
  },
  homeButton: {
    marginLeft: -4,
  },
  themeToggle: {
    marginLeft: 8,
  },
});

export default NavigationControls;
