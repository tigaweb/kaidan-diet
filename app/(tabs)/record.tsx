import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

type SessionSummary = {
  totalSessions: number;
  totalCalories: number;
  totalHeight: number;
};

export default function Record() {
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalHeight, setTotalHeight] = useState(0);

  useEffect(() => {
    const db = SQLite.openDatabaseSync('kaidandiet.db');
    
    db.withTransactionSync(() => {
      const result = db.getAllSync(
        'SELECT SUM(count) as totalSessions, SUM(calories) as totalCalories, SUM(height) as totalHeight FROM sessions;',
      );

      if (result && result.length > 0) {
        const data = result[0] as SessionSummary;
        setTotalSessions(data.totalSessions || 0);
        setTotalCalories(data.totalCalories || 0);
        setTotalHeight(data.totalHeight || 0);
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>記録</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.label}>往復回数</Text>
            <Text style={styles.value}>{totalSessions}回</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.label}>登った高さ</Text>
            <Text style={styles.value}>{totalHeight}m</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.label}>消費カロリー</Text>
            <Text style={styles.value}>{totalCalories}kcal</Text>
          </View>
        </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
  },
});
