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
    id: '',
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
      const engines = searchEngineService.getCustomEngines();
      setCustomEngines(engines);
    }
  }, [visible]);

  const handleEngineSelect = (engine: SearchEngine) => {
    searchEngineService.setCurrentEngine(engine.id);
    setCurrentEngine(engine);
  };

  const handleAddCustomEngine = () => {
    setShowCustomEngineForm(true);
  };

  const handleSaveCustomEngine = () => {
    const validation = searchEngineService.validateCustomEngine(newCustomEngine);
    
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    const success = searchEngineService.addCustomEngine(newCustomEngine);
    if (success) {
      setNewCustomEngine({
        id: '',
        name: '',
        baseUrl: '',
        searchPath: '/search',
        icon: '🔍',
        description: '',
      });
      setShowCustomEngineForm(false);
      const updatedEngines = searchEngineService.getCustomEngines();
      setCustomEngines(updatedEngines);
      Alert.alert('Success', 'Custom search engine added successfully');
    } else {
      Alert.alert('Error', 'Failed to add custom search engine');
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
            const success = searchEngineService.removeCustomEngine(engineId);
            if (success) {
              const updatedEngines = searchEngineService.getCustomEngines();
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

  const renderEngineItem = (engine: SearchEngine, isCustom: boolean = false) => (
    <TouchableOpacity
      style={[
        styles.engineItem,
        {
          backgroundColor: currentEngine?.id === engine.id ? colors.buttonPrimary : colors.surface,
          borderColor: currentEngine?.id === engine.id ? colors.buttonPrimary : colors.border,
        }
      ]}
      onPress={() => !isCustom && handleEngineSelect(engine)}
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
            onPress={() => handleDeleteCustomEngine(engine.id)}
          >
            <FiTrash2 size={16} color={colors.buttonSecondaryText} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
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
            {searchEngineService.getAvailableEngines().map((engine) => (
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
              renderEngineItem(engine as any, true)
            ))}
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
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SearchEngineSelector;
