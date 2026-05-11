import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { passwordManager, PasswordEntry, PasswordGeneratorOptions } from '../../services/PasswordManager';
import { FiEye, FiEyeOff, FiPlus, FiSearch, FiEdit2, FiTrash2, FiCopy, FiRefreshCw, FiLock, FiUnlock, FiSettings, FiChevronRight } from 'react-icons/fi';

interface PasswordManagerProps {
  visible: boolean;
  onClose: () => void;
  currentUrl?: string;
}

const PasswordManager: React.FC<PasswordManagerProps> = ({ visible, onClose, currentUrl }) => {
  const { colors } = useTheme();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [showGenerator, setShowGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState(30); // minutes
  const [enableAutofill, setEnableAutofill] = useState(true);
  const [showPasswordStrength, setShowPasswordStrength] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: currentUrl || '',
    notes: '',
    category: '',
    tags: '',
  });

  // Generator options
  const [generatorOptions, setGeneratorOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });

  useEffect(() => {
    if (visible) {
      checkUnlockStatus();
    }
  }, [visible]);

  useEffect(() => {
    if (isUnlocked) {
      loadPasswords();
    }
  }, [isUnlocked, visible]);

  const checkUnlockStatus = () => {
    setIsUnlocked(passwordManager.isUnlocked());
  };

  const loadPasswords = async () => {
    try {
      const allPasswords = await passwordManager.getAllPasswords();
      setPasswords(allPasswords);
    } catch (error) {
      console.error('Error loading passwords:', error);
    }
  };

  const handleUnlock = async () => {
    try {
      const success = await passwordManager.verifyMasterPassword(masterPassword);
      if (success) {
        setIsUnlocked(true);
        setMasterPassword('');
      } else {
        Alert.alert('Error', 'Invalid master password');
      }
    } catch (error) {
      console.error('Error unlocking:', error);
      Alert.alert('Error', 'Failed to unlock password manager');
    }
  };

  const handleLock = () => {
    passwordManager.lock();
    setIsUnlocked(false);
    setShowAddForm(false);
    setEditingPassword(null);
  };

  const handleAddPassword = async () => {
    try {
      if (!formData.title || !formData.username || !formData.password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await passwordManager.addPassword({
        ...formData,
        tags,
      });

      setFormData({
        title: '',
        username: '',
        password: '',
        url: currentUrl || '',
        notes: '',
        category: '',
        tags: '',
      });
      setShowAddForm(false);
      loadPasswords();
      Alert.alert('Success', 'Password saved successfully');
    } catch (error) {
      console.error('Error adding password:', error);
      Alert.alert('Error', 'Failed to save password');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!editingPassword || !formData.title || !formData.username || !formData.password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await passwordManager.updatePassword(editingPassword.id, {
        ...formData,
        tags,
      });

      setEditingPassword(null);
      setFormData({
        title: '',
        username: '',
        password: '',
        url: currentUrl || '',
        notes: '',
        category: '',
        tags: '',
      });
      loadPasswords();
      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password');
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this password?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await passwordManager.deletePassword(id);
              loadPasswords();
              Alert.alert('Success', 'Password deleted successfully');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting password:', error);
      Alert.alert('Error', 'Failed to delete password');
    }
  };

  const handleCopyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      Alert.alert('Success', 'Password copied to clipboard');
    } catch (error) {
      console.error('Error copying password:', error);
      Alert.alert('Error', 'Failed to copy password');
    }
  };

  const handleGeneratePassword = () => {
    try {
      const generatedPassword = passwordManager.generatePassword(generatorOptions);
      setFormData({ ...formData, password: generatedPassword });
      setShowGenerator(false);
    } catch (error) {
      console.error('Error generating password:', error);
      Alert.alert('Error', 'Failed to generate password');
    }
  };

  const startEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setFormData({
      title: password.title,
      username: password.username,
      password: password.password,
      url: password.url,
      notes: password.notes || '',
      category: password.category || '',
      tags: password.tags?.join(', ') || '',
    });
    setShowAddForm(true);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredPasswords = passwords.filter(password =>
    password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    password.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUnlockScreen = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.lockContainer}>
        <FiLock size={48} color={colors.textSecondary} />
        <Text style={[styles.title, { color: colors.text }]}>Password Manager</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your master password to unlock
        </Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Master Password"
          placeholderTextColor={colors.textSecondary}
          value={masterPassword}
          onChangeText={setMasterPassword}
          secureTextEntry
          onSubmitEditing={handleUnlock}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
          onPress={handleUnlock}
        >
          <Text style={[styles.buttonText, { color: colors.buttonPrimaryText }]}>Unlock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPasswordForm = () => (
    <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.formTitle, { color: colors.text }]}>
        {editingPassword ? 'Edit Password' : 'Add New Password'}
      </Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          color: colors.text 
        }]}
        placeholder="Title"
        placeholderTextColor={colors.textSecondary}
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          color: colors.text 
        }]}
        placeholder="Username/Email"
        placeholderTextColor={colors.textSecondary}
        value={formData.username}
        onChangeText={(text) => setFormData({ ...formData, username: text })}
      />
      
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={[styles.passwordInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => setShowGenerator(true)}
        >
          <FiRefreshCw size={16} color={colors.buttonSecondaryText} />
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          color: colors.text 
        }]}
        placeholder="URL"
        placeholderTextColor={colors.textSecondary}
        value={formData.url}
        onChangeText={(text) => setFormData({ ...formData, url: text })}
      />
      
      <TextInput
        style={[styles.input, styles.textArea, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          color: colors.text 
        }]}
        placeholder="Notes (optional)"
        placeholderTextColor={colors.textSecondary}
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        multiline
        numberOfLines={3}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          color: colors.text 
        }]}
        placeholder="Category (optional)"
        placeholderTextColor={colors.textSecondary}
        value={formData.category}
        onChangeText={(text) => setFormData({ ...formData, category: text })}
      />
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: colors.background, 
          borderColor: colors.border,
          color: colors.text 
        }]}
        placeholder="Tags (comma-separated)"
        placeholderTextColor={colors.textSecondary}
        value={formData.tags}
        onChangeText={(text) => setFormData({ ...formData, tags: text })}
      />
      
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => {
            setShowAddForm(false);
            setEditingPassword(null);
            setFormData({
              title: '',
              username: '',
              password: '',
              url: currentUrl || '',
              notes: '',
              category: '',
              tags: '',
            });
          }}
        >
          <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
          onPress={editingPassword ? handleUpdatePassword : handleAddPassword}
        >
          <Text style={[styles.buttonText, { color: colors.buttonPrimaryText }]}>
            {editingPassword ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPasswordList = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <FiSearch size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: colors.surface, 
              borderColor: colors.border,
              color: colors.text 
            }]}
            placeholder="Search passwords..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={() => setShowSettings(true)}
          >
            <FiSettings size={20} color={colors.buttonSecondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={() => setShowAddForm(true)}
          >
            <FiPlus size={20} color={colors.buttonSecondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.buttonSecondary }]}
            onPress={handleLock}
          >
            <FiLock size={20} color={colors.buttonSecondaryText} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.passwordList}>
        {filteredPasswords.map((password) => (
          <View key={password.id} style={[styles.passwordItem, { backgroundColor: colors.surface }]}>
            <View style={styles.passwordHeader}>
              <Text style={[styles.passwordTitle, { color: colors.text }]}>{password.title}</Text>
              <View style={styles.passwordActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.buttonSecondary }]}
                  onPress={() => handleCopyPassword(password.password)}
                >
                  <FiCopy size={16} color={colors.buttonSecondaryText} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.buttonSecondary }]}
                  onPress={() => startEdit(password)}
                >
                  <FiEdit2 size={16} color={colors.buttonSecondaryText} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.buttonSecondary }]}
                  onPress={() => handleDeletePassword(password.id)}
                >
                  <FiTrash2 size={16} color={colors.buttonSecondaryText} />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.passwordUsername, { color: colors.textSecondary }]}>
              {password.username}
            </Text>
            
            <Text style={[styles.passwordUrl, { color: colors.textSecondary }]}>
              {password.url}
            </Text>
            
            {password.category && (
              <Text style={[styles.passwordCategory, { color: colors.textSecondary }]}>
                Category: {password.category}
              </Text>
            )}
            
            {password.tags && password.tags.length > 0 && (
              <Text style={[styles.passwordTags, { color: colors.textSecondary }]}>
                Tags: {password.tags.join(', ')}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSettings = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.settingsHeader}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => setShowSettings(false)}
        >
          <FiLock size={20} color={colors.buttonSecondaryText} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.settingsContainer}>
        <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Security</Text>
          
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.background }]}
            onPress={() => {
              Alert.alert(
                'Change Master Password',
                'This will require you to enter your current master password and set a new one.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Continue', onPress: () => {
                    // TODO: Implement master password change flow
                    Alert.alert('Info', 'Master password change feature coming soon');
                  }}
                ]
              );
            }}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Change Master Password</Text>
            <FiChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={[styles.settingRow, { backgroundColor: colors.background }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Auto-lock (minutes)</Text>
            <TextInput
              style={[styles.settingInput, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={autoLockTime.toString()}
              onChangeText={(text) => setAutoLockTime(parseInt(text) || 30)}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Autofill</Text>
          
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.background }]}
            onPress={() => setEnableAutofill(!enableAutofill)}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Autofill</Text>
            <View style={[styles.toggle, { 
              backgroundColor: enableAutofill ? colors.buttonPrimary : colors.border 
            }]}>
              <View style={[styles.toggleKnob, { 
                backgroundColor: enableAutofill ? colors.buttonPrimaryText : colors.textSecondary,
                transform: [{ translateX: enableAutofill ? 12 : 0 }]
              }]} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Password Generator</Text>
          
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.background }]}
            onPress={() => setShowPasswordStrength(!showPasswordStrength)}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Show Password Strength</Text>
            <View style={[styles.toggle, { 
              backgroundColor: showPasswordStrength ? colors.buttonPrimary : colors.border 
            }]}>
              <View style={[styles.toggleKnob, { 
                backgroundColor: showPasswordStrength ? colors.buttonPrimaryText : colors.textSecondary,
                transform: [{ translateX: showPasswordStrength ? 12 : 0 }]
              }]} />
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.settingSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>Data Management</Text>
          
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.background }]}
            onPress={async () => {
              Alert.alert(
                'Export Passwords',
                'This will export all your passwords in an encrypted format. Keep this file safe!',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Export', 
                    onPress: async () => {
                      try {
                        const exportData = await passwordManager.exportPasswords();
                        if (exportData) {
                          // In a real app, this would trigger a file download
                          Alert.alert('Success', 'Passwords exported successfully');
                        }
                      } catch (error) {
                        Alert.alert('Error', 'Failed to export passwords');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Export Passwords</Text>
            <FiChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.background }]}
            onPress={() => {
              Alert.alert(
                'Import Passwords',
                'Import passwords from a previously exported file.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Import', 
                    onPress: () => {
                      // TODO: Implement file import
                      Alert.alert('Info', 'Import feature coming soon');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>Import Passwords</Text>
            <FiChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderGenerator = () => (
    <View style={[styles.generatorContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.formTitle, { color: colors.text }]}>Password Generator</Text>
      
      <View style={styles.optionRow}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>Length: {generatorOptions.length}</Text>
        <TextInput
          style={[styles.lengthInput, { 
            backgroundColor: colors.background, 
            borderColor: colors.border,
            color: colors.text 
          }]}
          value={generatorOptions.length.toString()}
          onChangeText={(text) => setGeneratorOptions({ 
            ...generatorOptions, 
            length: parseInt(text) || 16 
          })}
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.checkboxRow, { backgroundColor: colors.background }]}
        onPress={() => setGeneratorOptions({ 
          ...generatorOptions, 
          includeUppercase: !generatorOptions.includeUppercase 
        })}
      >
        <View style={[styles.checkbox, { 
          backgroundColor: generatorOptions.includeUppercase ? colors.buttonPrimary : colors.border 
        }]} />
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>Include Uppercase (A-Z)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.checkboxRow, { backgroundColor: colors.background }]}
        onPress={() => setGeneratorOptions({ 
          ...generatorOptions, 
          includeLowercase: !generatorOptions.includeLowercase 
        })}
      >
        <View style={[styles.checkbox, { 
          backgroundColor: generatorOptions.includeLowercase ? colors.buttonPrimary : colors.border 
        }]} />
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>Include Lowercase (a-z)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.checkboxRow, { backgroundColor: colors.background }]}
        onPress={() => setGeneratorOptions({ 
          ...generatorOptions, 
          includeNumbers: !generatorOptions.includeNumbers 
        })}
      >
        <View style={[styles.checkbox, { 
          backgroundColor: generatorOptions.includeNumbers ? colors.buttonPrimary : colors.border 
        }]} />
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>Include Numbers (0-9)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.checkboxRow, { backgroundColor: colors.background }]}
        onPress={() => setGeneratorOptions({ 
          ...generatorOptions, 
          includeSymbols: !generatorOptions.includeSymbols 
        })}
      >
        <View style={[styles.checkbox, { 
          backgroundColor: generatorOptions.includeSymbols ? colors.buttonPrimary : colors.border 
        }]} />
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>Include Symbols (!@#$%^&*)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.checkboxRow, { backgroundColor: colors.background }]}
        onPress={() => setGeneratorOptions({ 
          ...generatorOptions, 
          excludeSimilar: !generatorOptions.excludeSimilar 
        })}
      >
        <View style={[styles.checkbox, { 
          backgroundColor: generatorOptions.excludeSimilar ? colors.buttonPrimary : colors.border 
        }]} />
        <Text style={[styles.checkboxLabel, { color: colors.text }]}>Exclude Similar Characters (il1Lo0O)</Text>
      </TouchableOpacity>
      
      <View style={styles.generatorButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: colors.buttonSecondary }]}
          onPress={() => setShowGenerator(false)}
        >
          <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.buttonPrimary }]}
          onPress={handleGeneratePassword}
        >
          <Text style={[styles.buttonText, { color: colors.buttonPrimaryText }]}>Generate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {!isUnlocked ? (
          renderUnlockScreen()
        ) : showSettings ? (
          renderSettings()
        ) : showGenerator ? (
          renderGenerator()
        ) : showAddForm ? (
          renderPasswordForm()
        ) : (
          renderPasswordList()
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  passwordList: {
    flex: 1,
    padding: 16,
  },
  passwordItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  passwordActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  passwordUsername: {
    fontSize: 14,
    marginBottom: 4,
  },
  passwordUrl: {
    fontSize: 12,
    marginBottom: 4,
  },
  passwordCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  passwordTags: {
    fontSize: 12,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    fontSize: 16,
  },
  generateButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  generatorContainer: {
    flex: 1,
    padding: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
  },
  lengthInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
  },
  generatorButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingsContainer: {
    flex: 1,
    padding: 16,
  },
  settingSection: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  settingInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    position: 'relative',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: 2,
    left: 2,
  },
});

export default PasswordManager;
