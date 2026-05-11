import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { passwordManager } from '../../services/PasswordManager';
import { FiKey, FiLock, FiUnlock } from 'react-icons/fi';

interface PasswordManagerButtonProps {
  currentUrl?: string;
  onPress: () => void;
  style?: any;
}

const PasswordManagerButton: React.FC<PasswordManagerButtonProps> = ({ 
  currentUrl, 
  onPress, 
  style 
}) => {
  const { colors } = useTheme();
  const [hasPasswords, setHasPasswords] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    checkPasswordManagerStatus();
  }, [currentUrl]);

  const checkPasswordManagerStatus = async () => {
    try {
      const unlocked = passwordManager.isUnlocked();
      setIsUnlocked(unlocked);

      if (unlocked && currentUrl) {
        const passwords = await passwordManager.getPasswordsByUrl(currentUrl);
        setHasPasswords(passwords.length > 0);
      } else {
        setHasPasswords(false);
      }
    } catch (error) {
      console.error('Error checking password manager status:', error);
    }
  };

  const handlePress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: hasPasswords ? colors.buttonPrimary : colors.buttonSecondary,
          borderColor: colors.border 
        },
        style
      ]}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        {hasPasswords ? (
          <FiUnlock size={16} color={colors.buttonPrimaryText} />
        ) : (
          <FiKey size={16} color={colors.buttonSecondaryText} />
        )}
      </View>
      {hasPasswords && (
        <View style={[styles.indicator, { backgroundColor: colors.success }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default PasswordManagerButton;
