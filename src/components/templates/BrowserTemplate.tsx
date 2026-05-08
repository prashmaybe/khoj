import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Browser } from '../organisms';

interface BrowserTemplateProps {
  children?: React.ReactNode;
}

const BrowserTemplate: React.FC<BrowserTemplateProps> = ({ children }) => {
  return (
    <View style={styles.browserTemplate}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  browserTemplate: {
    flex: 1,
  },
});

export default BrowserTemplate;
