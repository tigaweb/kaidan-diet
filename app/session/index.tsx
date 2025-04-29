import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import * as SQLite from 'expo-sqlite';
import { SessionDBRow } from '@/types';

export default function Session() {
  const [count, setCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>(new Date());
  const pausedDurationRef = useRef<number>(0);

  const [sessionData, setSessionData] = useState<SessionDBRow>({
    id: 0,
    date: new Date().toISOString().split('T')[0],
    count: 0,
    calories: 0,
    height: 0,
    duration: 0
  });

  useEffect(() => {
    if (isTimerRunning) {
      const startTime = new Date();
      startTimeRef.current = startTime;
      
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) + pausedDurationRef.current;
        setDuration(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        pausedDurationRef.current = duration;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCount = () => {
    setCount(prev => prev + 1);
  };

  const handleEnd = () => {
    setIsTimerRunning(false);
    Alert.alert(
      "トレーニング終了",
      "トレーニングを終了しますか？",
      [
        {
          text: "キャンセル",
          style: "cancel",
          onPress: () => {
            setIsTimerRunning(true);
          }
        },
        {
          text: "終了",
          onPress: () => {
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
          <Text style={styles.timerText}>{formatTime(duration)}</Text>
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
    marginBottom: 20,
  },
  countButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
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