import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList, TextInput } from 'react-native';
import { Icon } from '../atoms';
import { KHOJ_LOGO_DEFAULT } from '../../constants/logos';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  visitCount: number;
  lastVisited: string;
  timestamp: number;
}

interface HistoryPageProps {
  onHistoryAction?: (action: string, historyId: string, data?: any) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onHistoryAction }) => {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      title: 'React Native Documentation',
      url: 'https://reactnative.dev/docs/getting-started',
      icon: 'globe',
      visitCount: 12,
      lastVisited: '2026-05-08 16:45',
      timestamp: 1715179500000
    },
    {
      id: '2',
      title: 'GitHub - prashmaybe/khoj',
      url: 'https://github.com/prashmaybe/khoj',
      icon: 'globe',
      visitCount: 8,
      lastVisited: '2026-05-08 15:30',
      timestamp: 1715175000000
    },
    {
      id: '3',
      title: 'TypeScript Handbook',
      url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      icon: 'globe',
      visitCount: 5,
      lastVisited: '2026-05-08 14:20',
      timestamp: 1715170800000
    },
    {
      id: '4',
      title: 'Electron Documentation',
      url: 'https://www.electronjs.org/docs/latest',
      icon: 'globe',
      visitCount: 3,
      lastVisited: '2026-05-08 13:15',
      timestamp: 1715166900000
    },
    {
      id: '5',
      title: 'Stack Overflow - React Native',
      url: 'https://stackoverflow.com/questions/tagged/react-native',
      icon: 'globe',
      visitCount: 7,
      lastVisited: '2026-05-08 12:00',
      timestamp: 1715162400000
    },
    {
      id: '6',
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org/en-US/',
      icon: 'globe',
      visitCount: 15,
      lastVisited: '2026-05-08 11:30',
      timestamp: 1715160600000
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const handleHistoryAction = (historyId: string, action: 'open' | 'delete' | 'copy' | 'newTab') => {
    const item = history.find(entry => entry.id === historyId);
    switch (action) {
      case 'open':
        onHistoryAction?.('open', historyId, item);
        break;
      case 'newTab':
        onHistoryAction?.('newTab', historyId, item);
        break;
      case 'copy':
        onHistoryAction?.('copy', historyId, item);
        break;
      case 'delete':
        Alert.alert(
          'Delete History Item',
          'Are you sure you want to delete this history item?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                setHistory(prev => prev.filter(item => item.id !== historyId));
                onHistoryAction?.('delete', historyId);
              }
            }
          ]
        );
        break;
    }
  };

  const clearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to clear all browsing history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            setHistory([]);
            onHistoryAction?.('clearAll', '');
          }
        }
      ]
    );
  };

  const clearRecentHistory = () => {
    Alert.alert(
      'Clear Recent History',
      'Select the time range to clear:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Last Hour', 
          onPress: () => {
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            setHistory(prev => prev.filter(item => item.timestamp < oneHourAgo));
          }
        },
        { 
          text: 'Last 24 Hours', 
          onPress: () => {
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            setHistory(prev => prev.filter(item => item.timestamp < oneDayAgo));
          }
        },
        { 
          text: 'Last Week', 
          onPress: () => {
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            setHistory(prev => prev.filter(item => item.timestamp < oneWeekAgo));
          }
        }
      ]
    );
  };

  const getFilteredHistory = () => {
    let filtered = history;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply time filter
    const now = Date.now();
    switch (selectedFilter) {
      case 'today':
        const today = new Date().setHours(0, 0, 0, 0);
        filtered = filtered.filter(item => item.timestamp >= today);
        break;
      case 'week':
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => item.timestamp >= weekAgo);
        break;
      case 'month':
        const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => item.timestamp >= monthAgo);
        break;
    }

    return filtered;
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyItem}>
      <TouchableOpacity 
        style={styles.historyContent}
        onPress={() => handleHistoryAction(item.id, 'open')}
      >
        <View style={styles.faviconContainer}>
          <Icon name={item.icon || 'globe'} size="small" />
        </View>
        <View style={styles.historyInfo}>
          <Text style={styles.pageTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.pageUrl} numberOfLines={1}>{item.url}</Text>
          <Text style={styles.visitInfo}>
            {item.visitCount} visits • {item.lastVisited}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.historyActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleHistoryAction(item.id, 'newTab')}
        >
          <Icon name="open" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleHistoryAction(item.id, 'copy')}
        >
          <Icon name="copy" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleHistoryAction(item.id, 'delete')}
        >
          <Icon name="trash" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredHistory = getFilteredHistory();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={KHOJ_LOGO_DEFAULT}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>{history.length} items</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Icon name="search" size="small" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search history..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {(['all', 'today', 'week', 'month'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearRecentHistory}
        >
          <Text style={styles.clearButtonText}>Clear Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearAllHistory}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        style={styles.historyList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching history found' : 'No history yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Your browsing history will appear here'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    color: '#7f8c8d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  historyList: {
    flex: 1,
    padding: 15,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  faviconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  pageUrl: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  visitInfo: {
    fontSize: 11,
    color: '#95a5a6',
  },
  historyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
  },
});

export default HistoryPage;
