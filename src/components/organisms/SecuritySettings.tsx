import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { securityService, SecuritySettings as SecuritySettingsType } from '../../services/SecurityService';
import { FiShield, FiLock, FiGlobe, FiTrash2, FiChevronRight } from 'react-icons/fi';

interface SecuritySettingsProps {
  visible: boolean;
  onClose: () => void;
}

const SecuritySettingsComponent: React.FC<SecuritySettingsProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<SecuritySettingsType>({
    httpsOnly: false,
    blockTrackers: true,
    blockCookies: false,
    clearDataOnClose: false,
    warnOnInsecureSites: true,
  });

  useEffect(() => {
    if (visible) {
      const loadedSettings = securityService.loadSecuritySettings();
      setSettings(loadedSettings);
    }
  }, [visible]);

  const updateSetting = (key: keyof SecuritySettingsType, value: boolean) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    securityService.saveSecuritySettings({ [key]: value });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all browsing data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await securityService.clearBrowsingData({
                browsingHistory: true,
                cookies: true,
                cache: true,
                localStorage: true,
                sessionStorage: true,
                passwords: true,
                autofillData: true,
                timeRange: 'allTime',
              });
              Alert.alert('Success', 'All browsing data cleared successfully');
            } catch (error) {
              console.error('Error clearing browsing data:', error);
              Alert.alert('Error', 'Failed to clear browsing data');
            }
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Security Settings
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.buttonSecondaryText }]}>
              ×
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              HTTPS-Only Mode
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Automatically upgrade all HTTP connections to HTTPS for enhanced security
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  HTTPS-Only Mode
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Upgrade HTTP to HTTPS automatically
                </Text>
              </View>
              <Switch
                value={settings.httpsOnly}
                onValueChange={(value) => updateSetting('httpsOnly', value)}
                trackColor={{ true: colors.buttonPrimary, false: colors.border }}
                thumbColor={colors.buttonPrimaryText}
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Privacy Protection
            </Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Block Trackers
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Block known tracking scripts and analytics
                </Text>
              </View>
              <Switch
                value={settings.blockTrackers}
                onValueChange={(value) => updateSetting('blockTrackers', value)}
                trackColor={{ true: colors.buttonPrimary, false: colors.border }}
                thumbColor={colors.buttonPrimaryText}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Block Cookies
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Prevent websites from storing cookies
                </Text>
              </View>
              <Switch
                value={settings.blockCookies}
                onValueChange={(value) => updateSetting('blockCookies', value)}
                trackColor={{ true: colors.buttonPrimary, false: colors.border }}
                thumbColor={colors.buttonPrimaryText}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Clear Data on Close
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Automatically clear browsing data when browser closes
                </Text>
              </View>
              <Switch
                value={settings.clearDataOnClose}
                onValueChange={(value) => updateSetting('clearDataOnClose', value)}
                trackColor={{ true: colors.buttonPrimary, false: colors.border }}
                thumbColor={colors.buttonPrimaryText}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Warn on Insecure Sites
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Show warnings for HTTP sites and mixed content
                </Text>
              </View>
              <Switch
                value={settings.warnOnInsecureSites}
                onValueChange={(value) => updateSetting('warnOnInsecureSites', value)}
                trackColor={{ true: colors.buttonPrimary, false: colors.border }}
                thumbColor={colors.buttonPrimaryText}
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Management
            </Text>
            
            <TouchableOpacity
              style={[styles.actionRow, { backgroundColor: colors.background }]}
              onPress={handleClearData}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.buttonSecondary }]}>
                <FiTrash2 size={20} color={colors.buttonSecondaryText} />
              </View>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Clear All Browsing Data
                </Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  Remove history, cookies, cache, and stored data
                </Text>
              </View>
              <FiChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default SecuritySettingsComponent;
