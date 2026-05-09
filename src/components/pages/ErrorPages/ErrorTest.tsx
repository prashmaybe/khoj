import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import ErrorPage from './ErrorPage';
import { Icon } from '../atoms';

interface ErrorTestProps {
  onClose: () => void;
}

const ErrorTest: React.FC<ErrorTestProps> = React.memo(({ onClose }) => {
  const [selectedError, setSelectedError] = useState<{ code: number; description: string; url: string } | null>(null);

  const errorScenarios = [
    { code: -105, description: 'DNS lookup failed', url: 'http://nonexistent-domain-12345.com' },
    { code: -106, description: 'No internet connection', url: 'https://google.com' },
    { code: -107, description: 'SSL protocol error', url: 'https://expired.badssl.com' },
    { code: -108, description: 'Connection timed out', url: 'https://timeout-test.com' },
    { code: -109, description: 'Connection refused', url: 'http://localhost:9999' },
    { code: -310, description: 'Too many redirects', url: 'https://redirect-loop.com' },
    { code: -6, description: 'File not found', url: 'file:///nonexistent/file.html' },
    { code: -10, description: 'Access denied', url: 'https://httpbin.org/status/403' },
    { code: -1, description: 'Unknown error', url: 'https://example.com' }
  ];

  if (selectedError) {
    return (
      <View style={styles.errorTestContainer}>
        <View style={styles.errorTestHeader}>
          <TouchableOpacity onPress={() => setSelectedError(null)} style={styles.backToTests}>
            <View style={styles.backToTestsRow}>
              <Icon name="arrow-back" size="small" style={{ color: '#1a73e8' }} />
              <Text style={styles.backToTestsText}>Back to Error Tests</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeTest}>
            <View style={styles.closeRow}>
              <Icon name="close" />
              <Text style={styles.closeTestText}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
        <ErrorPage
          errorCode={selectedError.code}
          errorDescription={selectedError.description}
          url={selectedError.url}
          onRetry={() => console.log('Retry clicked')}
        />
      </View>
    );
  }

  const renderScenario = ({ item, index }: { item: typeof errorScenarios[0]; index: number }) => (
    <TouchableOpacity
      key={index}
      onPress={() => setSelectedError(item)}
      style={styles.scenarioButton}
    >
      <Text style={styles.scenarioCode}>ERR_{item.code}</Text>
      <Text style={styles.scenarioDesc}>{item.description}</Text>
      <Text style={styles.scenarioUrl}>{item.url}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.errorTest}>
      <View style={styles.errorTestHeader}>
        <Text style={styles.title}>Browser Error Page Tests</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeTest}>
          <Icon name="close" />
        </TouchableOpacity>
      </View>
      <View style={styles.errorScenarios}>
        <Text style={styles.scenariosTitle}>Select an error scenario to test:</Text>
        <FlatList
          data={errorScenarios}
          renderItem={renderScenario}
          keyExtractor={(_, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.scenarioGrid}
          contentContainerStyle={styles.scenariosList}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  errorTestContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  errorTestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backToTests: {
    padding: 8,
  },
  backToTestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backToTestsText: {
    fontSize: 14,
    color: '#1a73e8',
  },
  closeTest: {
    padding: 8,
  },
  closeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  closeTestText: {
    fontSize: 18,
    color: '#666666',
  },
  errorTest: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#202124',
  },
  errorScenarios: {
    flex: 1,
    padding: 16,
  },
  scenariosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 16,
  },
  scenariosList: {
    gap: 16,
  },
  scenarioGrid: {
    justifyContent: 'space-between',
  },
  scenarioButton: {
    flex: 1,
    margin: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scenarioCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 8,
  },
  scenarioDesc: {
    fontSize: 14,
    color: '#202124',
    marginBottom: 8,
    fontWeight: '500',
  },
  scenarioUrl: {
    fontSize: 12,
    color: '#5f6368',
    fontStyle: 'italic',
  },
});

export default ErrorTest;
