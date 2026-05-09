import React from 'react';
import { View, StyleSheet } from 'react-native';
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

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.tabBar, borderBottomColor: colors.border }]}>
      {tabs.map(tab => (
        <Tab
          key={tab.id}
          id={tab.id}
          title={tab.title}
          faviconUrl={tab.faviconUrl}
          isActive={activeTabId === tab.id}
          isLoading={tab.isLoading}
          onClick={() => onTabClick(tab.id)}
          onClose={() => onTabClose(tab.id)}
          showCloseButton={tabs.length > 1}
        />
      ))}
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
