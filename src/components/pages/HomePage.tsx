import React from 'react';
import { View, StyleSheet } from 'react-native';
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
    <View style={styles.homePage}>
      <Browser {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  homePage: {
    flex: 1,
  },
});

export default HomePage;
