import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useMolecules, useAtoms } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface TabData {
  id: string;
  title: string;
  faviconUrl?: string | null;
  isLoading?: boolean;
}

interface TabBarProps {
  tabs: TabData[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const TabBar: React.FC<TabBarProps> = React.memo(({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab
}) => {
  const { colors } = useTheme();
  const { Tab } = useMolecules();
  const { Button, Icon } = useAtoms();
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // For React Native, we'll use a simpler approach
        // Get the window width and estimate container width
        const windowWidth = Dimensions.get('window').width;
        setContainerWidth(windowWidth - 32); // Account for padding
      }
    };

    updateWidth();
    const subscription = Dimensions.addEventListener('change', updateWidth);
    return () => subscription?.remove();
  }, []);

  const calculateTabWidth = (isActive: boolean) => {
    if (!containerWidth || tabs.length === 0) return { minWidth: 140, maxWidth: 240 };
    
    const newTabButtonWidth = 40;
    const padding = 16;
    const availableWidth = containerWidth - newTabButtonWidth - padding;
    
    if (isActive) {
      // Active tab gets half the space it used to get
      const inactiveTabWidth = Math.min(120, Math.max(80, availableWidth / tabs.length * 0.6));
      const activeTabWidth = Math.max(100, (availableWidth - (inactiveTabWidth * (tabs.length - 1))) / 2);
      return {
        minWidth: Math.min(activeTabWidth, 150),
        maxWidth: Math.min(activeTabWidth, 200)
      };
    } else {
      // Inactive tabs are more compact
      const width = Math.min(120, Math.max(80, availableWidth / tabs.length * 0.6));
      return {
        minWidth: width,
        maxWidth: width + 20
      };
    }
  };

  return (
    <View ref={containerRef} style={[styles.tabBar, { backgroundColor: colors.tabBar, borderBottomColor: colors.border }]}>
      {tabs.map(tab => {
        const isActive = activeTabId === tab.id;
        const tabWidth = calculateTabWidth(isActive);
        return (
          <Tab
            key={tab.id}
            id={tab.id}
            title={tab.title}
            faviconUrl={tab.faviconUrl}
            isActive={isActive}
            isLoading={tab.isLoading}
            onClick={() => onTabClick(tab.id)}
            onClose={() => onTabClose(tab.id)}
            showCloseButton={tabs.length > 1}
            customWidth={tabWidth}
          />
        );
      })}
      <Button style={styles.newTabButton} onPress={onNewTab}>
        <Icon name="add" />
      </Button>
    </View>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  newTabButton: {
    marginLeft: 6,
    width: 32,
    height: 28,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabBar;
