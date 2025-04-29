import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { SessionDBRow } from '@/types';

export default function Session() {
  const [count, setCount] = useState(0);
  const [sessionData, setSessionData] = useState<SessionDBRow>({
    id: 0,
    date: new Date().toISOString().split('T')[0],
    count: 0,
    calories: 0,
    height: 0,
    duration: 0
  });

  const handleCount = () => {
    setCount(prev => prev + 1);
  };

  const handleEnd = () => {
    Alert.alert(
      "トレーニング終了",
      "トレーニングを終了しますか？",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "終了",
          onPress: () => {
            const endTime = new Date();
            const startTime = new Date(sessionData.date);
            const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            
            const db = SQLite.openDatabaseSync('kaidandiet.db');
            db.withTransactionSync(() => {
              db.runSync(
                'INSERT INTO sessions (date, count, calories, height, duration) VALUES (?, ?, ?, ?, ?)',
                [sessionData.date, count, 0, 0, duration]
              );
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>トレーニング中</Text>
        <Text style={styles.subtitle}>階段を1往復するごとにボタンを押してください</Text>
        
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{count}</Text>
          <TouchableOpacity
            style={styles.countButton}
            onPress={handleCount}
          >
            <Text style={styles.countButtonText}>カウント</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEnd}
        >
          <Text style={styles.endButtonText}>終了</Text>
        </TouchableOpacity>
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
    marginBottom: 40,
  },
  countContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  countButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  countButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  endButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 'auto',
    marginBottom: 20,
  },
  endButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 