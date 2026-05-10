import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAtoms } from '../../hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onNavigate: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
}

const SearchBar = React.memo(forwardRef<any, SearchBarProps>(({
  value,
  onChange,
  onNavigate,
  onKeyPress,
  isLoading = false,
  placeholder = 'Enter URL or search...',
  disabled = false,
  isBookmarked = false,
  onBookmarkToggle
}, ref) => {
  const { colors } = useTheme();
  const { Input, Button, Icon } = useAtoms();

  return (
    <View style={styles.urlBar}>
      <View style={[
        styles.omnibox, 
        { backgroundColor: colors.inputBackground, borderColor: colors.borderSecondary },
        isLoading && { opacity: 0.7 }
      ]}>
        <Icon name="lock" style={[styles.omniboxLock, { color: colors.textSecondary }]} />
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
          onPress={onBookmarkToggle}
          variant="secondary"
          size="medium"
          disabled={disabled || isLoading}
          style={styles.bookmarkButton}
        >
          <Icon 
            name={isBookmarked ? 'bookmark-filled' : 'bookmark'} 
            style={[
              styles.bookmarkIcon,
              { color: isBookmarked ? colors.buttonPrimary : colors.textSecondary }
            ]} 
          />
        </Button>
        <Button
          onPress={onNavigate}
          variant="secondary"
          size="medium"
          disabled={disabled || isLoading}
          style={styles.navigateButton}
        >
          <Icon name={isLoading ? 'refresh' : 'arrow-forward'} />
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
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    borderWidth: 1,
  },
  bookmarkButton: {
    width: 34,
    height: 28,
    borderRadius: 999,
    marginRight: 4,
  },
  bookmarkIcon: {
    fontSize: 14,
  },
});

export default SearchBar;
