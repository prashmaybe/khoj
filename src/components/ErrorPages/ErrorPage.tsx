import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface ErrorPageProps {
  errorCode: number;
  errorDescription: string;
  url: string;
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = React.memo(({ 
  errorCode, 
  errorDescription, 
  url, 
  onRetry 
}) => {
  const getErrorDetails = (code: number) => {
    switch (code) {
      case -105: // ERR_NAME_NOT_RESOLVED
        return {
          icon: '🌐',
          title: "This site can't be reached",
          description: "The server at " + url + " can't be found because the DNS lookup failed.",
          suggestions: [
            "Check the address for typing errors",
            "Check your internet connection",
            "Try visiting a different website"
          ]
        };
      case -106: // ERR_INTERNET_DISCONNECTED
        return {
          icon: '📡',
          title: "No internet",
          description: "You are not connected to the internet. Check your network connection and try again.",
          suggestions: [
            "Check your network cables, modem, and router",
            "Reconnect to Wi-Fi",
            "Try using a different network"
          ]
        };
      case -107: // ERR_SSL_PROTOCOL_ERROR
        return {
          icon: '🔒',
          title: "Your connection is not private",
          description: "Attackers might be trying to steal your information from " + url,
          suggestions: [
            "Go back to the previous page",
            "Try reloading the page",
            "Check your connection is secure"
          ]
        };
      case -108: // ERR_CONNECTION_TIMED_OUT
        return {
          icon: '⏰',
          title: "Request Timeout",
          description: "The server at " + url + " took too long to respond.",
          suggestions: [
            "Check your internet connection",
            "Try reloading the page",
            "The server might be temporarily unavailable"
          ]
        };
      case -109: // ERR_CONNECTION_REFUSED
        return {
          icon: '🚫',
          title: "This site can't be reached",
          description: "The connection to " + url + " was refused.",
          suggestions: [
            "The server might be down",
            "Check if the URL is correct",
            "Try again later"
          ]
        };
      case -310: // ERR_TOO_MANY_REDIRECTS
        return {
          icon: '🔄',
          title: "This page isn't working",
          description: url + " redirected you too many times.",
          suggestions: [
            "Clear your cookies",
            "Try opening the page in a new tab",
            "The website might have a configuration issue"
          ]
        };
      case -6: // ERR_FILE_NOT_FOUND
        return {
          icon: '📁',
          title: "File not found",
          description: "The file at " + url + " could not be found.",
          suggestions: [
            "Check if the file path is correct",
            "Verify the file exists",
            "Check file permissions"
          ]
        };
      case -10: // ERR_ACCESS_DENIED
        return {
          icon: '🔐',
          title: "Access denied",
          description: "You don't have permission to access " + url,
          suggestions: [
            "Check your permissions",
            "Try logging in if required",
            "Contact the administrator"
          ]
        };
      default:
        return {
          icon: '⚠️',
          title: "Something went wrong",
          description: errorDescription || "An unexpected error occurred while loading " + url,
          suggestions: [
            "Try reloading the page",
            "Check your internet connection",
            "Try again later"
          ]
        };
    }
  };

  const errorDetails = getErrorDetails(errorCode);

  return (
    <ScrollView style={styles.errorPage}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>{errorDetails.icon}</Text>
        <Text style={styles.errorTitle}>{errorDetails.title}</Text>
        <Text style={styles.errorDescription}>{errorDetails.description}</Text>
        
        <View style={styles.errorCode}>
          <Text style={styles.errorCodeText}>Error code: </Text>
          <Text style={styles.codeValue}>{errorCode}</Text>
        </View>

        <View style={styles.errorSuggestions}>
          <Text style={styles.suggestionsTitle}>What you can try:</Text>
          {errorDetails.suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.suggestionItem}>• {suggestion}</Text>
          ))}
        </View>

        <View style={styles.errorActions}>
          {onRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => {}} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  errorPage: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDescription: {
    fontSize: 16,
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  errorCodeText: {
    fontSize: 14,
    color: '#5f6368',
  },
  codeValue: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '500',
  },
  errorSuggestions: {
    width: '100%',
    marginBottom: 32,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 16,
  },
  suggestionItem: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dadce0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#202124',
  },
});

export default ErrorPage;
