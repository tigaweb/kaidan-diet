import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export default function Session() {
  useEffect(() => {
    const db = SQLite.openDatabaseSync('kaidandiet.db');
    const now = new Date();
    const startTime = now.toISOString();

    db.withTransactionSync(() => {
      db.runSync(
        'INSERT INTO sessions (date, start_time, end_time, count, calories, height) VALUES (?, ?, ?, ?, ?, ?)',
        [now.toISOString().split('T')[0], startTime, startTime, 0, 0, 0]
      );
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>トレーニング中</Text>
        <Text style={styles.subtitle}>階段を1往復するごとにボタンを押してください</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 