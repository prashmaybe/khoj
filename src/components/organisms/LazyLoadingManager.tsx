import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { lazyLoadingService, TabState } from '../../services/LazyLoadingService';
import { FiSettings, FiZap, FiActivity, FiCpu, FiTrendingUp } from 'react-icons/fi';

interface LazyLoadingManagerProps {
  visible: boolean;
  onClose: () => void;
}

const LazyLoadingManager: React.FC<LazyLoadingManagerProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [tabStates, setTabStates] = useState<TabState[]>([]);
  const [memoryStats, setMemoryStats] = useState(lazyLoadingService.getMemoryStats());
  const [performanceMetrics, setPerformanceMetrics] = useState(lazyLoadingService.getPerformanceMetrics());
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [thresholds, setThresholds] = useState(lazyLoadingService.getMemoryThresholds());

  useEffect(() => {
    if (visible) {
      const states = lazyLoadingService.getAllTabStates();
      setTabStates(states);
      setMemoryStats(lazyLoadingService.getMemoryStats());
      setPerformanceMetrics(lazyLoadingService.getPerformanceMetrics());
      
      // Start monitoring if enabled
      if (monitoringEnabled) {
        lazyLoadingService.startMemoryMonitoring();
      }
    } else {
      lazyLoadingService.stopMemoryMonitoring();
    }
  }, [visible, monitoringEnabled]);

  const handleOptimizeNow = () => {
    lazyLoadingService.optimizeMemory();
    const updatedStates = lazyLoadingService.getAllTabStates();
    setTabStates(updatedStates);
    setMemoryStats(lazyLoadingService.getMemoryStats());
    setPerformanceMetrics(lazyLoadingService.getPerformanceMetrics());
    Alert.alert('Success', 'Memory optimization completed');
  };

  const handleAutoOptimizationToggle = (value: boolean) => {
    setAutoOptimization(value);
    if (value) {
      lazyLoadingService.startMemoryMonitoring();
    } else {
      lazyLoadingService.stopMemoryMonitoring();
    }
  };

  const handleMonitoringToggle = (value: boolean) => {
    setMonitoringEnabled(value);
    if (value) {
      lazyLoadingService.startMemoryMonitoring();
    } else {
      lazyLoadingService.stopMemoryMonitoring();
    }
  };

  const handleThresholdChange = (key: string, value: number) => {
    const newThresholds = { ...thresholds, [key]: value };
    setThresholds(newThresholds);
    lazyLoadingService.setMemoryThresholds(newThresholds);
  };

  const renderMemoryBar = () => {
    const percentage = memoryStats.totalMemoryUsage > 0 
      ? (memoryStats.totalMemoryUsage / thresholds.maxMemoryUsage) * 100 
      : 0;

    return (
      <View style={styles.memoryBarContainer}>
        <Text style={[styles.memoryBarLabel, { color: colors.text }]}>
          Memory Usage
        </Text>
        <View style={styles.memoryBar}>
          <View 
            style={[
              styles.memoryBarFill,
              { 
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: percentage > 80 ? colors.warning : percentage > 60 ? colors.buttonPrimary : colors.success
              }
            ]} 
          />
        </View>
        <Text style={[styles.memoryBarValue, { color: colors.text }]}>
          {percentage.toFixed(1)}%
        </Text>
      </View>
    );
  };

  const renderPerformanceChart = () => {
    const metrics = [
      { label: 'Tab Utilization', value: performanceMetrics.tabUtilization, color: colors.buttonPrimary },
      { label: 'Memory Efficiency', value: performanceMetrics.memoryEfficiency, color: colors.success },
      { label: 'Avg Load Time', value: performanceMetrics.averageLoadTime / 1000, color: colors.warning, unit: 's' },
    ];

    return (
      <View style={styles.performanceContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Performance Metrics
        </Text>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {metric.label}
            </Text>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricBarFill,
                  { 
                    width: `${metric.value}%`,
                    backgroundColor: metric.color
                  }
                ]} 
              />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {metric.value.toFixed(1)}{metric.unit || '%'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderThresholdSettings = () => (
    <View style={styles.thresholdContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Memory Thresholds
      </Text>
      
      <View style={styles.thresholdItem}>
        <Text style={[styles.thresholdLabel, { color: colors.text }]}>
          Max Tabs
        </Text>
        <Text style={[styles.thresholdValue, { color: colors.text }]}>
          {thresholds.maxTabs}
        </Text>
        <TouchableOpacity
          style={[styles.thresholdButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => {
            const newValue = Math.max(1, thresholds.maxTabs - 1);
            handleThresholdChange('maxTabs', newValue);
          }}
        >
          <Text style={[styles.thresholdButtonText, { color: colors.buttonSecondaryText }]}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.thresholdButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => {
            const newValue = thresholds.maxTabs + 1;
            handleThresholdChange('maxTabs', newValue);
          }}
        >
          <Text style={[styles.thresholdButtonText, { color: colors.buttonSecondaryText }]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.thresholdItem}>
        <Text style={[styles.thresholdLabel, { color: colors.text }]}>
          Suspension Threshold
        </Text>
        <Text style={[styles.thresholdValue, { color: colors.text }]}>
          {(thresholds.suspensionThreshold / (1024 * 1024)).toFixed(0)} MB
        </Text>
        <TouchableOpacity
          style={[styles.thresholdButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => {
            const newValue = Math.max(64 * 1024 * 1024, thresholds.suspensionThreshold - (64 * 1024 * 1024));
            handleThresholdChange('suspensionThreshold', newValue);
          }}
        >
          <Text style={[styles.thresholdButtonText, { color: colors.buttonSecondaryText }]}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.thresholdButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => {
            const newValue = thresholds.suspensionThreshold + (64 * 1024 * 1024);
            handleThresholdChange('suspensionThreshold', newValue);
          }}
        >
          <Text style={[styles.thresholdButtonText, { color: colors.buttonSecondaryText }]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.thresholdItem}>
        <Text style={[styles.thresholdLabel, { color: colors.text }]}>
          Max Memory Usage
        </Text>
        <Text style={[styles.thresholdValue, { color: colors.text }]}>
          {(thresholds.maxMemoryUsage / (1024 * 1024)).toFixed(0)} MB
        </Text>
        <TouchableOpacity
          style={[styles.thresholdButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => {
            const newValue = Math.max(128 * 1024 * 1024, thresholds.maxMemoryUsage - (128 * 1024 * 1024));
            handleThresholdChange('maxMemoryUsage', newValue);
          }}
        >
          <Text style={[styles.thresholdButtonText, { color: colors.buttonSecondaryText }]}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.thresholdButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => {
            const newValue = thresholds.maxMemoryUsage + (128 * 1024 * 1024);
            handleThresholdChange('maxMemoryUsage', newValue);
          }}
        >
          <Text style={[styles.thresholdButtonText, { color: colors.buttonSecondaryText }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
            Lazy Loading Manager
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.buttonSecondaryText }]}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Memory Overview */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Memory Overview
            </Text>
            
            {renderMemoryBar()}
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <FiCpu size={24} color={colors.buttonPrimary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {memoryStats.totalTabs}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Tabs
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <FiActivity size={24} color={colors.success} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {memoryStats.activeTabs}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Active
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <FiZap size={24} color={colors.warning} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {memoryStats.suspendedTabs}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Suspended
                </Text>
              </View>
            </View>
          </View>

          {/* Performance Metrics */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            {renderPerformanceChart()}
          </View>

          {/* Settings */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Settings
            </Text>
            
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Auto Optimization
              </Text>
              <Switch
                value={autoOptimization}
                onValueChange={handleAutoOptimizationToggle}
                trackColor={{ true: colors.buttonPrimary, false: colors.buttonSecondary }}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Memory Monitoring
              </Text>
              <Switch
                value={monitoringEnabled}
                onValueChange={handleMonitoringToggle}
                trackColor={{ true: colors.buttonPrimary, false: colors.buttonSecondary }}
              />
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.buttonPrimary }]}
              onPress={handleOptimizeNow}
            >
              <FiTrendingUp size={16} color={colors.buttonPrimaryText} />
              <Text style={[styles.actionButtonText, { color: colors.buttonPrimaryText }]}>
                Optimize Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Threshold Settings */}
          {renderThresholdSettings()}
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
  },
  contentContainer: {
    flex: 1,
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
  memoryBarContainer: {
    marginBottom: 16,
  },
  memoryBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  memoryBar: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
  },
  memoryBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  memoryBarValue: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  performanceContainer: {
    gap: 16,
  },
  metricItem: {
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  metricBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  thresholdContainer: {
    gap: 16,
  },
  thresholdItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  thresholdLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  thresholdValue: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  thresholdButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6c757d',
  },
  thresholdButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default LazyLoadingManager;
