import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { securityService, ClearDataOptions } from '../../services/SecurityService';
import { FiTrash2, FiClock, FiDatabase, FiShield, FiChevronRight } from 'react-icons/fi';

interface ClearBrowsingDataProps {
  visible: boolean;
  onClose: () => void;
}

const ClearBrowsingData: React.FC<ClearBrowsingDataProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  
  const [options, setOptions] = useState<ClearDataOptions>({
    browsingHistory: true,
    cookies: true,
    cache: true,
    localStorage: true,
    sessionStorage: true,
    passwords: false,
    autofillData: false,
    timeRange: 'lastHour',
  });

  const [isClearing, setIsClearing] = useState(false);

  const timeRangeOptions = [
    { label: 'Last Hour', value: 'lastHour' as const },
    { label: 'Last Day', value: 'lastDay' as const },
    { label: 'Last Week', value: 'lastWeek' as const },
    { label: 'Last Month', value: 'lastMonth' as const },
    { label: 'All Time', value: 'allTime' as const },
  ];

  const handleClearData = async () => {
    const selectedOptions = Object.entries(options)
      .filter(([_, value]) => value)
      .map(([key]) => key as keyof ClearDataOptions);

    if (selectedOptions.length === 0) {
      Alert.alert('No Selection', 'Please select at least one type of data to clear.');
      return;
    }

    const optionNames = selectedOptions.map(key => {
      switch (key) {
        case 'browsingHistory': return 'Browsing History';
        case 'cookies': return 'Cookies';
        case 'cache': return 'Cache';
        case 'localStorage': return 'Local Storage';
        case 'sessionStorage': return 'Session Storage';
        case 'passwords': return 'Saved Passwords';
        case 'autofillData': return 'Autofill Data';
        default: return key;
      }
    });

    const timeRangeText = timeRangeOptions.find(opt => opt.value === options.timeRange)?.label || 'Unknown';

    Alert.alert(
      'Confirm Clear Data',
      `This will permanently delete:\n\n${optionNames.join('\n')}\n\nTime range: ${timeRangeText}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              await securityService.clearBrowsingData(options);
              Alert.alert('Success', 'Browsing data cleared successfully');
            } catch (error) {
              console.error('Error clearing browsing data:', error);
              Alert.alert('Error', 'Failed to clear browsing data');
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const toggleOption = (key: keyof ClearDataOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setTimeRange = (timeRange: ClearDataOptions['timeRange']) => {
    setOptions(prev => ({ ...prev, timeRange }));
  };

  const getDataIcon = (key: keyof ClearDataOptions) => {
    switch (key) {
      case 'browsingHistory': return <FiClock size={20} color={colors.textSecondary} />;
      case 'cookies': return <FiDatabase size={20} color={colors.textSecondary} />;
      case 'cache': return <FiDatabase size={20} color={colors.textSecondary} />;
      case 'localStorage': return <FiDatabase size={20} color={colors.textSecondary} />;
      case 'sessionStorage': return <FiDatabase size={20} color={colors.textSecondary} />;
      case 'passwords': return <FiShield size={20} color={colors.textSecondary} />;
      case 'autofillData': return <FiDatabase size={20} color={colors.textSecondary} />;
      default: return <FiDatabase size={20} color={colors.textSecondary} />;
    }
  };

  const getDataLabel = (key: keyof ClearDataOptions) => {
    switch (key) {
      case 'browsingHistory': return 'Browsing History';
      case 'cookies': return 'Cookies';
      case 'cache': return 'Cache';
      case 'localStorage': return 'Local Storage';
      case 'sessionStorage': return 'Session Storage';
      case 'passwords': return 'Saved Passwords';
      case 'autofillData': return 'Autofill Data';
      default: return key;
    }
  };

  const getDataDescription = (key: keyof ClearDataOptions) => {
    switch (key) {
      case 'browsingHistory': return 'Clear your browsing history and visited pages';
      case 'cookies': return 'Remove cookies stored by websites';
      case 'cache': return 'Clear cached images and files';
      case 'localStorage': return 'Remove website data stored locally';
      case 'sessionStorage': return 'Clear temporary session data';
      case 'passwords': return 'Remove saved passwords and login data';
      case 'autofillData': return 'Clear saved form data and payment information';
      default: return '';
    }
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
            Clear Browsing Data
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
              Time Range
            </Text>
            <View style={styles.timeRangeContainer}>
              {timeRangeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeRangeOption,
                    {
                      backgroundColor: options.timeRange === option.value ? colors.buttonPrimary : colors.background,
                      borderColor: options.timeRange === option.value ? colors.buttonPrimary : colors.border,
                    }
                  ]}
                  onPress={() => setTimeRange(option.value)}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      {
                        color: options.timeRange === option.value ? colors.buttonPrimaryText : colors.text,
                      }
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Data Types
            </Text>
            
            {Object.entries(options).map(([key, value]) => {
              if (key === 'timeRange') return null;
              
              return (
                <View key={key} style={styles.dataTypeContainer}>
                  <TouchableOpacity
                    style={styles.dataTypeRow}
                    onPress={() => toggleOption(key as keyof ClearDataOptions)}
                  >
                    <View style={styles.dataTypeInfo}>
                      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                        {getDataIcon(key as keyof ClearDataOptions)}
                      </View>
                      <View style={styles.dataTypeText}>
                        <Text style={[styles.dataTypeLabel, { color: colors.text }]}>
                          {getDataLabel(key as keyof ClearDataOptions)}
                        </Text>
                        <Text style={[styles.dataTypeDescription, { color: colors.textSecondary }]}>
                          {getDataDescription(key as keyof ClearDataOptions)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  <Switch
                    value={value}
                    onValueChange={() => toggleOption(key as keyof ClearDataOptions)}
                    trackColor={{ true: colors.buttonPrimary, false: colors.border }}
                    thumbColor={colors.buttonPrimaryText}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.warningContainer}>
            <Text style={[styles.warningText, { color: colors.textSecondary }]}>
              ⚠️ This action cannot be undone. Please make sure you want to clear the selected data.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.clearButton,
              {
                backgroundColor: isClearing ? colors.border : colors.buttonPrimary,
                opacity: isClearing ? 0.6 : 1,
              }
            ]}
            onPress={handleClearData}
            disabled={isClearing}
          >
            <Text style={[styles.clearButtonText, { color: colors.buttonPrimaryText }]}>
              {isClearing ? 'Clearing...' : 'Clear Data'}
            </Text>
          </TouchableOpacity>
        </View>
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
  timeRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeRangeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dataTypeContainer: {
    marginBottom: 16,
  },
  dataTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataTypeText: {
    flex: 1,
  },
  dataTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dataTypeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  warningContainer: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 12,
    borderRadius: 4,
    marginVertical: 16,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClearBrowsingData;
