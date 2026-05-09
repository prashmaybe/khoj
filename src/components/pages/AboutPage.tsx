import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { KHOJ_LOGO_LARGE } from '../../constants/logos';

interface AboutPageProps {
  version?: string;
}

const AboutPage: React.FC<AboutPageProps> = ({ version = "0.0.1" }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Image 
          source={KHOJ_LOGO_LARGE}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Khoj Browser</Text>
        <Text style={styles.version}>Version {version}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          Khoj is a modern browser built with React Native and Electron, 
          providing a fast and lightweight browsing experience across multiple platforms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.featureItem}>• Cross-platform support (Windows, macOS, Linux)</Text>
        <Text style={styles.featureItem}>• Tab management</Text>
        <Text style={styles.featureItem}>• Fast navigation controls</Text>
        <Text style={styles.featureItem}>• Modern React Native interface</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technologies</Text>
        <Text style={styles.techItem}>• React Native</Text>
        <Text style={styles.techItem}>• Electron</Text>
        <Text style={styles.techItem}>• TypeScript</Text>
        <Text style={styles.techItem}>• WebView</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 Khoj Browser. Open source project.
        </Text>
        <Text style={styles.footerText}>
          GitHub: github.com/prashmaybe/khoj
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#34495e',
  },
  featureItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#34495e',
    marginBottom: 4,
  },
  techItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#34495e',
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default AboutPage;
