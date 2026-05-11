import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { lazyLoadingService, TabState } from '../../services/LazyLoadingService';
import { FiPause, FiPlay, FiTrash2, FiSettings, FiCpu, FiActivity } from 'react-icons/fi';

interface TabManagerProps {
  visible: boolean;
  onClose: () => void;
}

const TabManager: React.FC<TabManagerProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [tabStates, setTabStates] = useState<TabState[]>([]);
  const [memoryStats, setMemoryStats] = useState(lazyLoadingService.getMemoryStats());
  const [performanceMetrics, setPerformanceMetrics] = useState(lazyLoadingService.getPerformanceMetrics());
  const [recommendedActions, setRecommendedActions] = useState(lazyLoadingService.getRecommendedActions());

  useEffect(() => {
    if (visible) {
      const states = lazyLoadingService.getAllTabStates();
      setTabStates(states);
      setMemoryStats(lazyLoadingService.getMemoryStats());
      setPerformanceMetrics(lazyLoadingService.getPerformanceMetrics());
      setRecommendedActions(lazyLoadingService.getRecommendedActions());
    }
  }, [visible]);

  const handleSuspendTab = (tabId: string) => {
    const success = lazyLoadingService.suspendTab(tabId);
    if (success) {
      const updatedStates = lazyLoadingService.getAllTabStates();
      setTabStates(updatedStates);
      setMemoryStats(lazyLoadingService.getMemoryStats());
      setPerformanceMetrics(lazyLoadingService.getPerformanceMetrics());
      setRecommendedActions(lazyLoadingService.getRecommendedActions());
      Alert.alert('Success', 'Tab suspended for memory optimization');
    } else {
      Alert.alert('Error', 'Cannot suspend this tab (high priority or already suspended)');
    }
  };

  const handleResumeTab = (tabId: string) => {
    const success = lazyLoadingService.resumeTab(tabId);
    if (success) {
      const updatedStates = lazyLoadingService.getAllTabStates();
      setTabStates(updatedStates);
      setMemoryStats(lazyLoadingService.getMemoryStats());
      setPerformanceMetrics(lazyLoadingService.getPerformanceMetrics());
      setRecommendedActions(lazyLoadingService.getRecommendedActions());
      Alert.alert('Success', 'Tab resumed');
    } else {
      Alert.alert('Error', 'Cannot resume this tab');
    }
  };

  const handleOptimizeMemory = () => {
    lazyLoadingService.optimizeMemory();
    const updatedStates = lazyLoadingService.getAllTabStates();
    setTabStates(updatedStates);
    setMemoryStats(lazyLoadingService.getMemoryStats());
    setPerformanceMetrics(lazyLoadingService.getPerformanceMetrics());
    setRecommendedActions(lazyLoadingService.getRecommendedActions());
    Alert.alert('Success', 'Memory optimized successfully');
  };

  const handleClearSuspended = () => {
    Alert.alert(
      'Clear Suspended Tabs',
      'Are you sure you want to clear all suspended tabs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const suspendedTabs = tabStates.filter(tab => tab.isSuspended);
            suspendedTabs.forEach(tab => {
              lazyLoadingService.removeTabState(tab.id);
            });
            
            const updatedStates = lazyLoadingService.getAllTabStates();
            setTabStates(updatedStates);
            setMemoryStats(lazyLoadingService.getMemoryStats());
            setPerformanceMetrics(lazyLoadingService.getPerformanceMetrics());
            setRecommendedActions(lazyLoadingService.getRecommendedActions());
            Alert.alert('Success', 'All suspended tabs cleared');
          },
        },
      ]
    );
  };

  const renderTabItem = ({ item }: { item: TabState }) => (
    <View style={[
      styles.tabItem,
      {
        backgroundColor: item.isSuspended ? colors.surface : colors.background,
        borderColor: item.isSuspended ? colors.border : colors.buttonSecondary,
        opacity: item.isSuspended ? 0.7 : 1,
      }
    ]}>
      <View style={styles.tabInfo}>
        <Text style={[
          styles.tabTitle,
          { color: item.isSuspended ? colors.textSecondary : colors.text }
        ]} numberOfLines={1}>
          {item.title}
        </Text>
        
        <Text style={[
          styles.tabUrl,
          { color: colors.textSecondary }
        ]} numberOfLines={1}>
          {item.url}
        </Text>
        
        <View style={styles.tabMeta}>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority, colors) }
          ]}>
            <Text style={[styles.priorityText, { color: '#ffffff' }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          
          <Text style={[styles.memoryUsage, { color: colors.textSecondary }]}>
            {formatMemoryUsage(item.memoryUsage)}
          </Text>
        </View>
      </View>
      
      <View style={styles.tabActions}>
        {item.isSuspended ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.resumeButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={() => handleResumeTab(item.id)}
          >
            <FiPlay size={16} color={colors.buttonPrimaryText} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.suspendButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={() => handleSuspendTab(item.id)}
            disabled={item.priority === 'high'}
          >
            <FiPause size={16} color={colors.buttonSecondaryText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getPriorityColor = (priority: string, colors: any) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return colors.buttonSecondary;
    }
  };

  const formatMemoryUsage = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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
            Tab Manager
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.buttonSecondaryText }]}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Memory Statistics */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Memory Statistics
          </Text>
          
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
              <FiActivity size={24} color={colors.buttonPrimary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {memoryStats.activeTabs}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Active Tabs
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <FiPause size={24} color={colors.warning} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {memoryStats.suspendedTabs}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Suspended Tabs
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <FiSettings size={24} color={memoryStats.totalMemoryUsage > 256 * 1024 * 1024 ? colors.warning : colors.buttonPrimary} />
              <Text style={[
                styles.statValue,
                { color: memoryStats.totalMemoryUsage > 256 * 1024 * 1024 ? colors.warning : colors.text }
              ]}>
                {formatMemoryUsage(memoryStats.totalMemoryUsage)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Memory Usage
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Performance Metrics
          </Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {performanceMetrics.tabUtilization.toFixed(1)}%
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Tab Utilization
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {performanceMetrics.memoryEfficiency.toFixed(1)}%
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Memory Efficiency
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {(performanceMetrics.averageLoadTime / 1000).toFixed(1)}s
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Avg Load Time
              </Text>
            </View>
          </View>
        </View>

        {/* Recommended Actions */}
        {recommendedActions.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recommended Actions
            </Text>
            
            {recommendedActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionItem,
                  {
                    backgroundColor: action.priority === 'high' ? colors.warning : colors.buttonSecondary,
                    borderColor: action.priority === 'high' ? colors.warning : colors.border,
                  }
                ]}
                onPress={() => {
                  if (action.action === 'optimize-memory') {
                    handleOptimizeMemory();
                  } else if (action.action === 'suspend-low-priority-tabs') {
                    // Auto-suspend low priority tabs
                    const lowPriorityTabs = tabStates.filter(tab => tab.priority === 'low' && !tab.isSuspended);
                    lowPriorityTabs.slice(0, Math.ceil(lowPriorityTabs.length / 2)).forEach(tab => {
                      handleSuspendTab(tab.id);
                    });
                  } else if (action.action === 'resume-recent-tabs') {
                    // Resume recently used suspended tabs
                    const suspendedTabs = tabStates.filter(tab => tab.isSuspended);
                    const recentTabs = suspendedTabs
                      .sort((a, b) => b.lastAccessed - a.lastAccessed)
                      .slice(0, 3);
                    recentTabs.forEach(tab => {
                      handleResumeTab(tab.id);
                    });
                  }
                }}
              >
                <Text style={[
                  styles.actionTitle,
                  { color: action.priority === 'high' ? colors.warning : colors.text }
                ]}>
                  {action.action.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                </Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tab List */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tab Management
            </Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity
                style={[styles.sectionButton, { backgroundColor: colors.buttonPrimary }]}
                onPress={handleOptimizeMemory}
              >
                <FiSettings size={16} color={colors.buttonPrimaryText} />
                <Text style={[styles.sectionButtonText, { color: colors.buttonPrimaryText }]}>
                  Optimize
                </Text>
              </TouchableOpacity>
              
              {memoryStats.suspendedTabs > 0 && (
                <TouchableOpacity
                  style={[styles.sectionButton, { backgroundColor: colors.buttonSecondary }]}
                  onPress={handleClearSuspended}
                >
                  <FiTrash2 size={16} color={colors.buttonSecondaryText} />
                  <Text style={[styles.sectionButtonText, { color: colors.buttonSecondaryText }]}>
                    Clear Suspended
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <FlatList
            data={tabStates}
            renderItem={renderTabItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.tabList}
          />
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  actionItem: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666666',
  },
  tabList: {
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  tabInfo: {
    flex: 1,
    marginRight: 12,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabUrl: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  tabMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  memoryUsage: {
    fontSize: 12,
    color: '#666666',
  },
  tabActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suspendButton: {
    backgroundColor: '#6c757d',
  },
  resumeButton: {
    backgroundColor: '#28a745',
  },
});

export default TabManager;
