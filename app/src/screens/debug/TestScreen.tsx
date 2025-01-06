import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Card, Title, Paragraph } from 'react-native-paper';
import { runAllTests, testTransactionFlow, testAlertFlow } from '../../utils/testUtils';

export const TestScreen = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Override console.log to capture logs
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    setLogs(prev => [...prev, args.join(' ')]);
  };

  const handleRunTests = async (testFn: () => Promise<boolean | void>) => {
    setIsRunning(true);
    setLogs([]);
    try {
      await testFn();
    } catch (error) {
      console.log('❌ Test execution error:', error);
    }
    setIsRunning(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Debug Test Panel</Title>
          <Paragraph>Run tests to verify functionality</Paragraph>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => handleRunTests(runAllTests)}
              loading={isRunning}
              disabled={isRunning}
              style={styles.button}
            >
              Run All Tests
            </Button>

            <Button
              mode="outlined"
              onPress={() => handleRunTests(testTransactionFlow)}
              disabled={isRunning}
              style={styles.button}
            >
              Test Transactions
            </Button>

            <Button
              mode="outlined"
              onPress={() => handleRunTests(testAlertFlow)}
              disabled={isRunning}
              style={styles.button}
            >
              Test Alerts
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.logsCard]}>
        <Card.Content>
          <Title>Test Logs</Title>
          <ScrollView style={styles.logs}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logLine}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
  logsCard: {
    flex: 1,
  },
  logs: {
    marginTop: 8,
    maxHeight: '100%',
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
}); 