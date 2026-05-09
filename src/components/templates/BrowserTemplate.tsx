import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useOrganisms } from '../../hooks';

interface BrowserTemplateProps {
  children?: React.ReactNode;
}

const BrowserTemplate: React.FC<BrowserTemplateProps> = React.memo(({ children }) => {
  const { Browser } = useOrganisms();
  return (
    <View style={styles.browserTemplate}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  browserTemplate: {
    flex: 1,
  },
});

export default BrowserTemplate;
