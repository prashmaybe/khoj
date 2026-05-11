import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { searchEngineService, SearchEngine, CustomSearchEngine } from '../../services/SearchEngineService';
import { FiSearch, FiPlus, FiTrash2, FiSettings, FiChevronRight, FiEdit3, FiGlobe, FiCheck } from 'react-icons/fi';

interface SearchEngineSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const SearchEngineSelector: React.FC<SearchEngineSelectorProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [currentEngine, setCurrentEngine] = useState<SearchEngine | null>(null);
  const [showCustomEngineForm, setShowCustomEngineForm] = useState(false);
  const [customEngines, setCustomEngines] = useState<CustomSearchEngine[]>([]);
  const [editingCustomEngine, setEditingCustomEngine] = useState<CustomSearchEngine | null>(null);
  const [newCustomEngine, setNewCustomEngine] = useState<CustomSearchEngine>({
    name: '',
    baseUrl: '',
    searchPath: '/search',
    icon: '🔍',
    description: '',
  });

  useEffect(() => {
    if (visible) {
      const engine = searchEngineService.getCurrentEngine();
      setCurrentEngine(engine);
      const engines = SearchEngineService.getCustomEngines();
      setCustomEngines(engines);
    }
  }, [visible]);

  const handleEngineSelect = (engine: SearchEngine) => {
    SearchEngineService.setCurrentEngine(engine.id);
    setCurrentEngine(engine);
  };

  const handleAddCustomEngine = () => {
    setShowCustomEngineForm(true);
  };

  const handleSaveCustomEngine = () => {
    const validation = SearchEngineService.validateCustomEngine(newCustomEngine);
    
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    const success = SearchEngineService.addCustomEngine(newCustomEngine);
    if (success) {
      setNewCustomEngine({
        name: '',
        baseUrl: '',
        searchPath: '/search',
        icon: '🔍',
        description: '',
      });
      setShowCustomEngineForm(false);
      const updatedEngines = SearchEngineService.getCustomEngines();
      setCustomEngines(updatedEngines);
      Alert.alert('Success', 'Custom search engine added successfully');
    } else {
      Alert.alert('Error', 'Failed to add custom search engine');
    }
  };

  const handleEditCustomEngine = (engine: CustomSearchEngine) => {
    setEditingCustomEngine(engine);
    setNewCustomEngine(engine);
  };

  const handleUpdateCustomEngine = () => {
    if (!editingCustomEngine) return;

    const validation = SearchEngineService.validateCustomEngine(newCustomEngine);
    
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    const success = SearchEngineService.addCustomEngine(newCustomEngine);
    if (success) {
      setEditingCustomEngine(null);
      setNewCustomEngine({
        name: '',
        baseUrl: '',
        searchPath: '/search',
        icon: '🔍',
        description: '',
      });
      setShowCustomEngineForm(false);
      const updatedEngines = SearchEngineService.getCustomEngines();
      setCustomEngines(updatedEngines);
      Alert.alert('Success', 'Custom search engine updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update custom search engine');
    }
  };

  const handleDeleteCustomEngine = (engineId: string) => {
    Alert.alert(
      'Delete Search Engine',
      'Are you sure you want to delete this custom search engine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = SearchEngineService.removeCustomEngine(engineId);
            if (success) {
              const updatedEngines = SearchEngineService.getCustomEngines();
              setCustomEngines(updatedEngines);
              Alert.alert('Success', 'Custom search engine deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete custom search engine');
            }
          },
        },
      ]
    );
  };

  const handleSetAsDefault = (engineId: string) => {
    const success = SearchEngineService.setCurrentEngine(engineId);
    if (success) {
      const engine = SearchEngineService.getEngineById(engineId);
      if (engine) {
        setCurrentEngine(engine);
        Alert.alert('Success', `${engine.name} set as default search engine`);
      }
    } else {
      Alert.alert('Error', 'Failed to set default search engine');
    }
  };

  const renderEngineItem = (engine: SearchEngine | CustomSearchEngine, isCustom: boolean = false) => (
    <TouchableOpacity
      style={[
        styles.engineItem,
        {
          backgroundColor: currentEngine?.id === engine.id ? colors.buttonPrimary : colors.surface,
          borderColor: currentEngine?.id === engine.id ? colors.buttonPrimary : colors.border,
        }
      ]}
      onPress={() => !isCustom && handleEngineSelect(engine as SearchEngine)}
    >
      <View style={styles.engineInfo}>
        <Text style={styles.engineIcon}>{engine.icon}</Text>
        <View style={styles.engineDetails}>
          <Text style={[styles.engineName, { color: colors.text }]}>
            {engine.name}
          </Text>
          <Text style={[styles.engineDescription, { color: colors.textSecondary }]}>
            {engine.description}
          </Text>
          {engine.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: colors.buttonPrimary }]}>
              <Text style={[styles.defaultText, { color: colors.buttonPrimaryText }]}>
                Default
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {isCustom && (
        <View style={styles.customEngineActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={() => handleEditCustomEngine(engine as CustomSearchEngine)}
          >
            <FiEdit3 size={16} color={colors.buttonSecondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={() => handleDeleteCustomEngine(engine.id)}
          >
            <FiTrash2 size={16} color={colors.buttonSecondaryText} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCustomEngineForm = () => (
    <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.formTitle, { color: colors.text }]}>
        {editingCustomEngine ? 'Edit Custom Search Engine' : 'Add Custom Search Engine'}
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.text }]}>
          Name
        </Text>
        <TextInput
          style={[styles.formInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Enter search engine name"
          placeholderTextColor={colors.textSecondary}
          value={newCustomEngine.name}
          onChangeText={(text) => setNewCustomEngine({ ...newCustomEngine, name: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.text }]}>
          Base URL
        </Text>
        <TextInput
          style={[styles.formInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="https://example.com"
          placeholderTextColor={colors.textSecondary}
          value={newCustomEngine.baseUrl}
          onChangeText={(text) => setNewCustomEngine({ ...newCustomEngine, baseUrl: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.text }]}>
          Search Path
        </Text>
        <TextInput
          style={[styles.formInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="/search"
          placeholderTextColor={colors.textSecondary}
          value={newCustomEngine.searchPath}
          onChangeText={(text) => setNewCustomEngine({ ...newCustomEngine, searchPath: text })}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: colors.text }]}>
          Description
        </Text>
        <TextInput
          style={[styles.formInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Enter a description"
          placeholderTextColor={colors.textSecondary}
          value={newCustomEngine.description}
          onChangeText={(text) => setNewCustomEngine({ ...newCustomEngine, description: text })}
          multiline
        />
      </View>
    </View>

    <View style={styles.formButtons}>
      <TouchableOpacity
        style={[styles.formButton, styles.cancelButton, { backgroundColor: colors.buttonSecondary }]}
        onPress={() => {
          setShowCustomEngineForm(false);
          setEditingCustomEngine(null);
          setNewCustomEngine({
            name: '',
            baseUrl: '',
            searchPath: '/search',
            icon: '🔍',
            description: '',
          });
        }}
      >
        <Text style={[styles.formButtonText, { color: colors.buttonSecondaryText }]}>
          Cancel
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.formButton, styles.saveButton, { backgroundColor: colors.buttonPrimary }]}
        onPress={editingCustomEngine ? handleUpdateCustomEngine : handleSaveCustomEngine}
        disabled={!newCustomEngine.name.trim() || !newCustomEngine.baseUrl.trim()}
      >
        <Text style={[styles.formButtonText, { color: colors.buttonPrimaryText }]}>
          {editingCustomEngine ? 'Update' : 'Add'}
        </Text>
      </TouchableOpacity>
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
            Search Engine Settings
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.buttonSecondaryText }]}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Built-in Search Engines */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Built-in Search Engines
            </Text>
            {SearchEngineService.getAvailableEngines().map((engine) => (
              renderEngineItem(engine, false)
            ))}
          </View>

          {/* Custom Search Engines */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Custom Search Engines
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.buttonPrimary }]}
                onPress={handleAddCustomEngine}
              >
                <FiPlus size={16} color={colors.buttonPrimaryText} />
              </TouchableOpacity>
            </View>
            
            {customEngines.map((engine) => (
              renderEngineItem(engine, true)
            ))}
          </View>

          {/* Quick Actions */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            
            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.background }]}
              onPress={() => SearchEngineService.resetToDefault()}
            >
              <FiGlobe size={20} color={colors.buttonPrimary} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Reset to Default
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionItem, { backgroundColor: colors.background }]}
              onPress={() => {
                const stats = SearchEngineService.getSearchStats();
                Alert.alert(
                  'Search Statistics',
                  `Total Searches: ${stats.totalSearches}\nMost Used: ${stats.mostUsedEngine}\nLast Search: ${stats.lastSearch}`,
                  [{ text: 'OK', style: 'default' }]
                );
              }}
            >
              <FiCheck size={20} color={colors.buttonPrimary} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Search Statistics
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showCustomEngineForm && renderCustomEngineForm()}
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
  engineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  engineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  engineIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  engineDetails: {
    flex: 1,
  },
  engineName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  engineDescription: {
    fontSize: 12,
    color: '#666666',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
  },
  customEngineActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  formButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchEngineSelector;
