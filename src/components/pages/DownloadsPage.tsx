import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList } from 'react-native';
import { KHOJ_LOGO_DEFAULT } from '../../constants/logos';

interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: string;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'failed';
  date: string;
  filePath: string;
}

interface DownloadsPageProps {
  onDownloadAction?: (action: string, downloadId: string) => void;
}

const DownloadsPage: React.FC<DownloadsPageProps> = ({ onDownloadAction }) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: '1',
      filename: 'react-native-documentation.pdf',
      url: 'https://reactnative.dev/docs/next/getting-started',
      size: '2.4 MB',
      progress: 100,
      status: 'completed',
      date: '2026-05-08 14:30',
      filePath: '/Users/prash/Downloads/react-native-documentation.pdf'
    },
    {
      id: '2',
      filename: 'khoj-source.zip',
      url: 'https://github.com/prashmaybe/khoj/archive/main.zip',
      size: '15.7 MB',
      progress: 65,
      status: 'downloading',
      date: '2026-05-08 15:45',
      filePath: '/Users/prash/Downloads/khoj-source.zip'
    },
    {
      id: '3',
      filename: 'typescript-handbook.epub',
      url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      size: '1.2 MB',
      progress: 30,
      status: 'paused',
      date: '2026-05-08 16:20',
      filePath: '/Users/prash/Downloads/typescript-handbook.epub'
    },
    {
      id: '4',
      filename: 'electron-api-demo.dmg',
      url: 'https://github.com/electron/electron-api-demos/releases/latest',
      size: '45.3 MB',
      progress: 0,
      status: 'failed',
      date: '2026-05-08 13:15',
      filePath: '/Users/prash/Downloads/electron-api-demo.dmg'
    }
  ]);

  const handleDownloadAction = (downloadId: string, action: 'resume' | 'pause' | 'cancel' | 'retry' | 'open' | 'delete') => {
    switch (action) {
      case 'resume':
        setDownloads(prev => prev.map(download => 
          download.id === downloadId 
            ? { ...download, status: 'downloading' as const }
            : download
        ));
        onDownloadAction?.('resume', downloadId);
        break;
      case 'pause':
        setDownloads(prev => prev.map(download => 
          download.id === downloadId 
            ? { ...download, status: 'paused' as const }
            : download
        ));
        onDownloadAction?.('pause', downloadId);
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Download',
          'Are you sure you want to cancel this download?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Yes', 
              style: 'destructive',
              onPress: () => {
                setDownloads(prev => prev.filter(d => d.id !== downloadId));
                onDownloadAction?.('cancel', downloadId);
              }
            }
          ]
        );
        break;
      case 'retry':
        setDownloads(prev => prev.map(download => 
          download.id === downloadId 
            ? { ...download, status: 'downloading' as const, progress: 0 }
            : download
        ));
        onDownloadAction?.('retry', downloadId);
        break;
      case 'open':
        onDownloadAction?.('open', downloadId);
        break;
      case 'delete':
        Alert.alert(
          'Delete Download',
          'Are you sure you want to delete this download?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                setDownloads(prev => prev.filter(d => d.id !== downloadId));
                onDownloadAction?.('delete', downloadId);
              }
            }
          ]
        );
        break;
    }
  };

  const clearCompletedDownloads = () => {
    Alert.alert(
      'Clear Completed',
      'Are you sure you want to remove all completed downloads?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setDownloads(prev => prev.filter(d => d.status !== 'completed'));
          }
        }
      ]
    );
  };

  const getStatusColor = (status: DownloadItem['status']) => {
    switch (status) {
      case 'downloading': return '#3498db';
      case 'completed': return '#27ae60';
      case 'paused': return '#f39c12';
      case 'failed': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const renderDownloadItem = ({ item }: { item: DownloadItem }) => (
    <View style={styles.downloadItem}>
      <View style={styles.downloadHeader}>
        <View style={styles.downloadInfo}>
          <Text style={styles.filename} numberOfLines={1}>{item.filename}</Text>
          <Text style={styles.downloadMeta}>{item.size} • {item.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      {item.status === 'downloading' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
      )}

      <View style={styles.downloadActions}>
        {item.status === 'downloading' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.pauseButton]} 
              onPress={() => handleDownloadAction(item.id, 'pause')}
            >
              <Text style={styles.actionButtonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => handleDownloadAction(item.id, 'cancel')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === 'paused' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.resumeButton]} 
              onPress={() => handleDownloadAction(item.id, 'resume')}
            >
              <Text style={styles.actionButtonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => handleDownloadAction(item.id, 'cancel')}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === 'completed' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.openButton]} 
              onPress={() => handleDownloadAction(item.id, 'open')}
            >
              <Text style={styles.actionButtonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={() => handleDownloadAction(item.id, 'delete')}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === 'failed' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.retryButton]} 
              onPress={() => handleDownloadAction(item.id, 'retry')}
            >
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={() => handleDownloadAction(item.id, 'delete')}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const completedCount = downloads.filter(d => d.status === 'completed').length;
  const activeCount = downloads.filter(d => d.status === 'downloading' || d.status === 'paused').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={KHOJ_LOGO_DEFAULT}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>Downloads</Text>
          <Text style={styles.subtitle}>{activeCount} active • {completedCount} completed</Text>
        </View>
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={clearCompletedDownloads}
          disabled={completedCount === 0}
        >
          <Text style={[styles.clearButtonText, { opacity: completedCount > 0 ? 1 : 0.5 }]}>
            Clear Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={downloads}
        renderItem={renderDownloadItem}
        keyExtractor={(item) => item.id}
        style={styles.downloadsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No downloads yet</Text>
            <Text style={styles.emptySubtext}>Downloads will appear here when you start downloading files</Text>
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
  actionsBar: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadsList: {
    flex: 1,
    padding: 15,
  },
  downloadItem: {
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
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  downloadInfo: {
    flex: 1,
    marginRight: 10,
  },
  filename: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  downloadMeta: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  downloadActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: '#27ae60',
  },
  pauseButton: {
    backgroundColor: '#f39c12',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  openButton: {
    backgroundColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#95a5a6',
  },
  retryButton: {
    backgroundColor: '#9b59b6',
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

export default DownloadsPage;
