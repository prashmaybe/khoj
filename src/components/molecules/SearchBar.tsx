import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Icon } from '../atoms';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onNavigate: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar = React.memo(forwardRef<any, SearchBarProps>(({
  value,
  onChange,
  onNavigate,
  onKeyPress,
  isLoading = false,
  placeholder = 'Search or type a URL',
  disabled = false
}, ref) => {
  return (
    <View style={styles.urlBar}>
      <View style={[styles.omnibox, isLoading && styles.omniboxLoading]}>
        <Icon name="🔒" style={styles.omniboxLock} />
        <Input
          ref={ref}
          value={value}
          onChangeText={onChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          variant="url"
          disabled={disabled || isLoading}
        />
        <Button
          onPress={onNavigate}
          variant="secondary"
          size="medium"
          disabled={disabled || isLoading}
          style={styles.navigateButton}
        >
          {isLoading ? '⟳' : '→'}
        </Button>
      </View>
    </View>
  );
}));

const styles = StyleSheet.create({
  urlBar: {
    flexDirection: 'row',
    flex: 1,
    maxWidth: 980,
    marginHorizontal: 'auto',
    width: '100%',
  },
  omnibox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  omniboxLoading: {
    opacity: 0.7,
  },
  omniboxLock: {
    fontSize: 12,
    opacity: 0.65,
    width: 18,
    textAlign: 'center',
  },
  navigateButton: {
    width: 34,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
});

export default SearchBar;
