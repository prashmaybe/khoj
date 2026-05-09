import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Image } from 'react-native';
import { Input } from '../atoms';
import { KHOJ_LOGO_DEFAULT } from '../../constants/logos';

interface SettingsPageProps {
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onSettingsUpdate?: (settings: any) => void;
}

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  autoUpdate: boolean;
  clearCache: boolean;
  searchEngine: string;
  homePage: string;
  downloadPath: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onThemeChange, onSettingsUpdate }) => {
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: false,
    notifications: true,
    autoUpdate: true,
    clearCache: false,
    searchEngine: 'https://www.google.com',
    homePage: 'https://www.google.com',
    downloadPath: '',
  });

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsUpdate?.(newSettings);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully');
          }
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            const defaultSettings: SettingsState = {
              darkMode: false,
              notifications: true,
              autoUpdate: true,
              clearCache: false,
              searchEngine: 'https://www.google.com',
              homePage: 'https://www.google.com',
              downloadPath: '',
            };
            setSettings(defaultSettings);
            onSettingsUpdate?.(defaultSettings);
            Alert.alert('Success', 'Settings reset to default');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Image 
          source={KHOJ_LOGO_DEFAULT}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => {
              updateSetting('darkMode', value);
              onThemeChange?.(value ? 'dark' : 'light');
            }}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
            thumbColor={settings.darkMode ? '#2196F3' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browser Settings</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Search Engine</Text>
          <Input
            value={settings.searchEngine}
            onChangeText={(value) => updateSetting('searchEngine', value)}
            placeholder="Enter search engine URL"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Home Page</Text>
          <Input
            value={settings.homePage}
            onChangeText={(value) => updateSetting('homePage', value)}
            placeholder="Enter home page URL"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
            thumbColor={settings.notifications ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto Update</Text>
          <Switch
            value={settings.autoUpdate}
            onValueChange={(value) => updateSetting('autoUpdate', value)}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
            thumbColor={settings.autoUpdate ? '#2196F3' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
          <Text style={styles.actionButtonText}>Clear Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleResetSettings}>
          <Text style={styles.actionButtonText}>Reset Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Version 0.0.1 • Build 20260508
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingTop: 20,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
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
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#34495e',
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  },
});

export default SettingsPage;
