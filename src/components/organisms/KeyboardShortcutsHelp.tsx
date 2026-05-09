import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { KeyboardShortcuts } from '../../services/KeyboardShortcuts';
import { Icon } from '../atoms';

interface KeyboardShortcutsHelpProps {
  visible: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = React.memo(({ visible, onClose }) => {
  const [shortcuts] = useState(() => {
    const ks = new KeyboardShortcuts({});
    return ks.getAllShortcuts();
  });

  if (!visible) return null;

  const categories = [...new Set(shortcuts.map((s: any) => s.category))];

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Keyboard Shortcuts</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {categories.map((category: string) => (
            <View key={category} style={styles.category}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {shortcuts
                .filter((shortcut: any) => shortcut.category === category)
                .map((shortcut: any, index: number) => (
                  <View key={index} style={styles.shortcutRow}>
                    <Text style={styles.shortcutKey}>{shortcut.shortcut}</Text>
                    <Text style={styles.shortcutDescription}>{shortcut.description}</Text>
                  </View>
                ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  shortcutKey: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a73e8',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 80,
    textAlign: 'center',
  },
  shortcutDescription: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginLeft: 16,
  },
});

export default KeyboardShortcutsHelp;
