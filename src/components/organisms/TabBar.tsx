import React from 'react';
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
    <div className="tab-bar">
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
      <Button className="new-tab-button" onClick={onNewTab}>
        +
      </Button>
    </div>
  );
};

export default TabBar;
