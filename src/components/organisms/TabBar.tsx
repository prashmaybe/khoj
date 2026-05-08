import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tab } from '../molecules';
import { Button } from '../atoms';

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

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab
}) => {
  return (
    <View style={styles.tabBar}>
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
      <Button style={styles.newTabButton} onClick={onNewTab}>
        +
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  newTabButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabBar;
