import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAtoms } from '../../hooks';
import { preferencesStorage, BookmarkItem } from '../../services/PreferencesStorage';

interface BookmarksBarProps {
  visible: boolean;
  onBookmarkClick: (bookmark: BookmarkItem) => void;
  onBookmarkRightClick?: (bookmark: BookmarkItem) => void;
  onAddBookmark?: () => void;
}

const BookmarksBar: React.FC<BookmarksBarProps> = ({
  visible,
  onBookmarkClick,
  onBookmarkRightClick,
  onAddBookmark
}) => {
  const { colors } = useTheme();
  const { Icon } = useAtoms();
  const [hoveredBookmark, setHoveredBookmark] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    // Load bookmarks from storage
    const loadedBookmarks = preferencesStorage.loadBookmarks();
    setBookmarks(loadedBookmarks.slice(0, 6)); // Show first 6 bookmarks in bar
  }, []);

  const handleBookmarkPress = (bookmark: BookmarkItem) => {
    onBookmarkClick(bookmark);
  };

  const handleBookmarkLongPress = (bookmark: BookmarkItem) => {
    Alert.alert(
      'Bookmark Options',
      `${bookmark.title}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open in New Tab', 
          onPress: () => {
            // This would open in a new tab
            onBookmarkClick(bookmark);
          }
        },
        { 
          text: 'Edit', 
          onPress: () => {
            // This would open edit dialog
            console.log('Edit bookmark:', bookmark);
          }
        },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Bookmark',
              `Are you sure you want to delete "${bookmark.title}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => {
                    console.log('Delete bookmark:', bookmark);
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const renderBookmark = (bookmark: BookmarkItem) => (
    <TouchableOpacity
      key={bookmark.id}
      style={[
        styles.bookmark,
        {
          backgroundColor: hoveredBookmark === bookmark.id 
            ? colors.buttonNav 
            : 'transparent'
        }
      ]}
      onPress={() => handleBookmarkPress(bookmark)}
      onLongPress={() => handleBookmarkLongPress(bookmark)}
      onPressIn={() => setHoveredBookmark(bookmark.id)}
      onPressOut={() => setHoveredBookmark(null)}
    >
      <View style={styles.favicon}>
        <Icon name={bookmark.icon || 'globe'} size="small" />
      </View>
      <Text 
        style={[
          styles.bookmarkText,
          { color: colors.text }
        ]}
        numberOfLines={1}
      >
        {bookmark.title}
      </Text>
    </TouchableOpacity>
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, { borderBottomColor: colors.border, backgroundColor: colors.toolbar }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Bookmark Button */}
        <TouchableOpacity
          style={[
            styles.bookmark,
            styles.addBookmark,
            {
              backgroundColor: hoveredBookmark === 'add' 
                ? colors.buttonNav 
                : colors.surface
            }
          ]}
          onPress={onAddBookmark}
          onPressIn={() => setHoveredBookmark('add')}
          onPressOut={() => setHoveredBookmark(null)}
        >
          <View style={styles.addIcon}>
            <Icon name="add" size="small" />
          </View>
          <Text 
            style={[
              styles.bookmarkText,
              styles.addText,
              { color: colors.textSecondary }
            ]}
          >
            Add Page
          </Text>
        </TouchableOpacity>

        {/* Separator */}
        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        {/* Bookmarks */}
        {bookmarks.map(renderBookmark)}

        {/* More Bookmarks Indicator */}
        <TouchableOpacity style={styles.moreBookmarks}>
          <Icon name="ellipsis" size="medium" style={{ color: colors.textSecondary }} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 32,
    borderBottomWidth: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  bookmark: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderRadius: 4,
    minWidth: 60,
    maxWidth: 150,
  },
  addBookmark: {
    minWidth: 80,
  },
  favicon: {
    width: 14,
    height: 14,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkText: {
    fontSize: 11,
    fontWeight: '500',
  },
  addIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontStyle: 'italic',
  },
  separator: {
    width: 1,
    height: 16,
    marginHorizontal: 4,
  },
  moreBookmarks: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

export default BookmarksBar;
