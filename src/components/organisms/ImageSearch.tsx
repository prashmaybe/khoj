import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { imageSearchService, ImageSearchResult, ImageSearchOptions } from '../../services/ImageSearchService';
import { FiSearch, FiDownload, FiCopy, FiSettings, FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi';

interface ImageSearchProps {
  visible: boolean;
  onClose: () => void;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageSearchResult | null>(null);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await imageSearchService.getSearchResults({
        query,
        provider: 'google',
        safeSearch: false,
        imageSize: 'all',
        colorType: 'any',
        imageType: 'any',
        license: 'any',
      });
      setResults(searchResults);
      imageSearchService.addToSearchHistory(query, 'google');
    } catch (error) {
      console.error('Error searching images:', error);
      Alert.alert('Error', 'Failed to search images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image: ImageSearchResult) => {
    setSelectedImage(image);
  };

  const handleDownload = async (image: ImageSearchResult) => {
    try {
      await imageSearchService.downloadImage(image.url, `${image.title.replace(/[^a-z0-9]/gi, '_')}.jpg`);
      Alert.alert('Success', 'Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Error', 'Failed to download image');
    }
  };

  const handleCopyUrl = async (image: ImageSearchResult) => {
    try {
      await imageSearchService.copyImageUrl(image.url);
      Alert.alert('Success', 'Image URL copied to clipboard');
    } catch (error) {
      console.error('Error copying image URL:', error);
      Alert.alert('Error', 'Failed to copy image URL');
    }
  };

  const renderImageItem = ({ item }: { item: ImageSearchResult }) => (
    <TouchableOpacity
      style={[
        styles.imageItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }
      ]}
      onPress={() => handleImageSelect(item)}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={[
          styles.thumbnail,
          {
            width: windowWidth / 2 - 20,
            height: 150,
          }
        ]}
        resizeMode="cover"
      />
      
      <View style={styles.imageInfo}>
        <Text style={[styles.imageTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.imageMeta}>
          <Text style={[styles.imageSource, { color: colors.textSecondary }]}>
            {item.source}
          </Text>
          <Text style={[styles.imageSize, { color: colors.textSecondary }]}>
            {`${item.width}×${item.height}`}
          </Text>
        </View>
      </View>
      
      <View style={styles.imageActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => handleCopyUrl(item)}
        >
          <FiCopy size={16} color={colors.buttonSecondaryText} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.buttonPrimary }]}
          onPress={() => handleDownload(item)}
        >
          <FiDownload size={16} color={colors.buttonPrimaryText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderImageModal = () => {
    if (!selectedImage) return null;

    return (
      <Modal
        visible={!!selectedImage}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedImage.title}
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
              onPress={() => setSelectedImage(null)}
            >
              <FiX size={20} color={colors.buttonSecondaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Image
              source={{ uri: selectedImage.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            
            <View style={styles.modalInfo}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Source: {selectedImage.source}
              </Text>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Size: {selectedImage.width}×{selectedImage.height}
              </Text>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Type: {selectedImage.type}
              </Text>
              {selectedImage.tags.length > 0 && (
                <Text style={[styles.infoLabel, { color: colors.text }]}>
                  Tags: {selectedImage.tags.join(', ')}
                </Text>
              )}
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.buttonSecondary }]}
              onPress={() => handleCopyUrl(selectedImage)}
            >
              <FiCopy size={18} color={colors.buttonSecondaryText} />
              <Text style={[styles.modalButtonText, { color: colors.buttonSecondaryText }]}>
                Copy URL
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.buttonPrimary }]}
              onPress={() => handleDownload(selectedImage)}
            >
              <FiDownload size={18} color={colors.buttonPrimaryText} />
              <Text style={[styles.modalButtonText, { color: colors.buttonPrimaryText }]}>
                Download
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
            Image Search
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.buttonSecondaryText }]}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.searchInputContainer}>
            <FiSearch size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { 
                backgroundColor: colors.background, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="Search for images..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Searching for images...
              </Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderImageItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.resultsList}
              columnWrapperStyle={styles.gridRow}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No images found. Try a different search term or adjust your filters.
              </Text>
            </View>
          )}
        </View>
      </View>

      {renderImageModal()}
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 12,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  imageItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    borderRadius: 6,
  },
  imageInfo: {
    flex: 1,
    padding: 12,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageSource: {
    fontSize: 12,
    color: '#666666',
  },
  imageSize: {
    fontSize: 12,
    color: '#666666',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  modalInfo: {
    marginTop: 16,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsList: {
    gap: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
});

export default ImageSearch;
