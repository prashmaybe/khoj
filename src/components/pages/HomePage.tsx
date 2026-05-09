import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useOrganisms } from '../../hooks';

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

const HomePage: React.FC<HomePageProps> = ({
  tabs,
  activeTabId,
  url,
  onUrlChange,
  onNavigate,
  onKeyPress,
  onTabClick,
  onTabClose,
  onNewTab,
  onBack,
  onForward,
  onReload,
  onHome,
  onRetryLoad,
}) => {
  const { Browser } = useOrganisms();

  return (
    <View style={styles.homePage}>
      <Browser {...{
        tabs,
        activeTabId,
        url,
        onUrlChange,
        onNavigate,
        onKeyPress,
        onTabClick,
        onTabClose,
        onNewTab,
        onBack,
        onForward,
        onReload,
        onHome,
        onRetryLoad,
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  homePage: {
    flex: 1,
  },
});

export default HomePage;
