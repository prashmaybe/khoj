import React from 'react';
import { Browser } from '../organisms';

interface HomePageProps {
  tabs: any[];
  activeTabId: string | null;
  url: string;
  onUrlChange: (url: string) => void;
  onNavigate: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onRetryLoad: () => void;
}

const HomePage: React.FC<HomePageProps> = (props) => {
  return (
    <div className="home-page">
      <Browser {...props} />
    </div>
  );
};

export default HomePage;
