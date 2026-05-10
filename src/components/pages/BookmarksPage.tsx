import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList, TextInput } from 'react-native';
import { useAtoms } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { KHOJ_LOGO_DEFAULT } from '../../constants/logos';
import { preferencesStorage, BookmarkItem } from '../../services/PreferencesStorage';

interface BookmarkFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface BookmarksPageProps {
  onBookmarkAction?: (action: string, bookmarkId: string, data?: any) => void;
  onNavigateToBookmark?: (bookmarkId: string) => void;
  onNewTab?: (bookmarkId: string) => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({
  onBookmarkAction,
  onNavigateToBookmark,
  onNewTab,
}) => {
  const { colors } = useTheme();
  const { Icon } = useAtoms();

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    // Load bookmarks from storage
    const loadedBookmarks = preferencesStorage.loadBookmarks();
    
    // If no bookmarks exist, add default ones
    if (loadedBookmarks.length === 0) {
      const defaultBookmarks: BookmarkItem[] = [
        {
          id: '1',
          title: 'React Native Documentation',
          url: 'https://reactnative.dev/docs/getting-started',
          icon: 'globe',
          folder: 'Development',
          dateAdded: '2026-05-08',
          tags: ['react', 'mobile', 'documentation']
        },
        {
          id: '2',
          title: 'GitHub - prashmaybe/khoj',
          url: 'https://github.com/prashmaybe/khoj',
          icon: 'globe',
          folder: 'Development',
          dateAdded: '2026-05-07',
          tags: ['github', 'browser', 'project']
        },
        {
          id: '3',
          title: 'TypeScript Handbook',
          url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
          icon: 'globe',
          folder: 'Learning',
          dateAdded: '2026-05-06',
          tags: ['typescript', 'programming', 'handbook']
        },
        {
          id: '4',
          title: 'Electron Documentation',
          url: 'https://www.electronjs.org/docs/latest',
          icon: 'globe',
          folder: 'Development',
          dateAdded: '2026-05-05',
          tags: ['electron', 'desktop', 'documentation']
        },
        {
          id: '5',
          title: 'Stack Overflow',
          url: 'https://stackoverflow.com/',
          icon: 'globe',
          folder: 'Resources',
          dateAdded: '2026-05-04',
          tags: ['programming', 'qa', 'community']
        },
        {
          id: '6',
          title: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/',
          icon: 'globe',
          folder: 'Resources',
          dateAdded: '2026-05-03',
          tags: ['web', 'documentation', 'reference']
        }
      ];
      setBookmarks(defaultBookmarks);
      preferencesStorage.saveBookmarks(defaultBookmarks);
    } else {
      setBookmarks(loadedBookmarks);
    }
  }, []);

  const [folders] = useState<BookmarkFolder[]>([
    { id: '1', name: 'All Bookmarks', color: '#3498db', icon: 'folder' },
    { id: '2', name: 'Development', color: '#27ae60', icon: 'laptop' },
    { id: '3', name: 'Learning', color: '#f39c12', icon: 'reader' },
    { id: '4', name: 'Resources', color: '#9b59b6', icon: 'globe' },
  ]);

  const [selectedFolder, setSelectedFolder] = useState('All Bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '', folder: 'Development' });

  const handleBookmarkAction = (bookmarkId: string, action: 'open' | 'edit' | 'delete' | 'copy' | 'newTab') => {
    const item = bookmarks.find(entry => entry.id === bookmarkId);
    switch (action) {
      case 'open':
        onBookmarkAction?.('open', bookmarkId, item);
        break;
      case 'newTab':
        onBookmarkAction?.('newTab', bookmarkId, item);
        break;
      case 'copy':
        onBookmarkAction?.('copy', bookmarkId, item);
        break;
      case 'edit':
        onBookmarkAction?.('edit', bookmarkId, item);
        break;
      case 'delete':
        Alert.alert(
          'Delete Bookmark',
          'Are you sure you want to delete this bookmark?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                preferencesStorage.removeBookmark(bookmarkId);
                setBookmarks(prev => prev.filter(item => item.id !== bookmarkId));
                onBookmarkAction?.('delete', bookmarkId);
              }
            }
          ]
        );
        break;
    }
  };

  const addBookmark = () => {
    if (!newBookmark.title || !newBookmark.url) {
      Alert.alert('Error', 'Please enter both title and URL');
      return;
    }

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newBookmark.title,
      url: newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`,
      folder: newBookmark.folder,
      dateAdded: new Date().toISOString().split('T')[0],
      tags: []
    };

    preferencesStorage.addBookmark(bookmark);
    setBookmarks(prev => [bookmark, ...prev]);
    setNewBookmark({ title: '', url: '', folder: 'Development' });
    setShowAddBookmark(false);
    onBookmarkAction?.('add', bookmark.id, bookmark);
  };

  const getFilteredBookmarks = () => {
    let filtered = bookmarks;

    // Apply folder filter
    if (selectedFolder !== 'All Bookmarks') {
      filtered = filtered.filter(item => item.folder === selectedFolder);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false
      );
    }

    return filtered;
  };

  const renderBookmarkItem = ({ item }: { item: BookmarkItem }) => (
    <View style={styles.bookmarkItem}>
      <TouchableOpacity 
        style={styles.bookmarkContent}
        onPress={() => handleBookmarkAction(item.id, 'open')}
      >
        <View style={styles.faviconContainer}>
          <Icon name={item.icon || 'globe'} size="small" />
        </View>
        <View style={styles.bookmarkInfo}>
          <Text style={styles.bookmarkTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.bookmarkUrl} numberOfLines={1}>{item.url}</Text>
          <View style={styles.bookmarkMeta}>
            <Text style={styles.folderTag}>{item.folder}</Text>
            <Text style={styles.dateAdded}>Added {item.dateAdded}</Text>
          </View>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.bookmarkActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleBookmarkAction(item.id, 'newTab')}
        >
          <Icon name="open" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleBookmarkAction(item.id, 'copy')}
        >
          <Icon name="copy" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleBookmarkAction(item.id, 'edit')}
        >
          <Icon name="pencil" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleBookmarkAction(item.id, 'delete')}
        >
          <Icon name="trash" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFolderItem = (folder: BookmarkFolder) => (
    <TouchableOpacity
      key={folder.id}
      style={[
        styles.folderButton,
        selectedFolder === folder.name && styles.folderButtonActive,
        { borderLeftColor: folder.color }
      ]}
      onPress={() => setSelectedFolder(folder.name)}
    >
      <View style={styles.folderIcon}>
        <Icon name={folder.icon} size="small" />
      </View>
      <Text style={[
        styles.folderButtonText,
        selectedFolder === folder.name && styles.folderButtonTextActive
      ]}>
        {folder.name}
      </Text>
      <Text style={styles.folderCount}>
        {folder.name === 'All Bookmarks' 
          ? bookmarks.length 
          : bookmarks.filter(b => b.folder === folder.name).length
        }
      </Text>
    </TouchableOpacity>
  );

  const filteredBookmarks = getFilteredBookmarks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={KHOJ_LOGO_DEFAULT}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>Bookmarks</Text>
          <Text style={styles.subtitle}>{bookmarks.length} bookmarks</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddBookmark(true)}
        >
          <View style={styles.addButtonRow}>
            <Icon name="add" size="small" />
            <Text style={styles.addButtonText}>Add</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {folders.map(renderFolderItem)}
          </ScrollView>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <View style={styles.searchIcon}>
                <Icon name="search" size="small" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <FlatList
            data={filteredBookmarks}
            renderItem={renderBookmarkItem}
            keyExtractor={(item) => item.id}
            style={styles.bookmarksList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No matching bookmarks found' : 'No bookmarks yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Start adding bookmarks to see them here'
                  }
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {showAddBookmark && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Bookmark</Text>
              <TouchableOpacity onPress={() => setShowAddBookmark(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={newBookmark.title}
                  onChangeText={(value) => setNewBookmark(prev => ({ ...prev, title: value }))}
                  placeholder="Enter bookmark title"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>URL</Text>
                <TextInput
                  style={styles.input}
                  value={newBookmark.url}
                  onChangeText={(value) => setNewBookmark(prev => ({ ...prev, url: value }))}
                  placeholder="https://example.com"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Folder</Text>
                <View style={styles.folderOptions}>
                  {folders.filter(f => f.name !== 'All Bookmarks').map(folder => (
                    <TouchableOpacity
                      key={folder.id}
                      style={[
                        styles.folderOption,
                        newBookmark.folder === folder.name && styles.folderOptionSelected
                      ]}
                      onPress={() => setNewBookmark(prev => ({ ...prev, folder: folder.name }))}
                    >
                      <Text style={styles.folderOptionIcon}>{folder.icon}</Text>
                      <Text style={styles.folderOptionText}>{folder.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowAddBookmark(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={addBookmark}
              >
                <Text style={styles.saveButtonText}>Add Bookmark</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingVertical: 15,
  },
  folderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  folderButtonActive: {
    backgroundColor: '#f8f9fa',
  },
  folderIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  folderButtonTextActive: {
    color: '#3498db',
    fontWeight: '600',
  },
  folderCount: {
    fontSize: 12,
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mainContent: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#ffffff',
    padding: 15,
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
  bookmarksList: {
    flex: 1,
    padding: 15,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  bookmarkContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  faviconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  bookmarkUrl: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  bookmarkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  folderTag: {
    fontSize: 10,
    color: '#3498db',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    fontWeight: '600',
  },
  dateAdded: {
    fontSize: 10,
    color: '#95a5a6',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  bookmarkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    fontSize: 20,
    color: '#7f8c8d',
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
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
  folderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  folderOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#3498db',
  },
  folderOptionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  folderOptionText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookmarksPage;
