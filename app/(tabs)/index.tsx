import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from "react";
import { SessionSummary } from '@/types';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalHeight, setTotalHeight] = useState(0);

  const initDatabase = () => {
    const db = SQLite.openDatabaseSync('kaidandiet.db');

    db.withTransactionSync(() => {
      // 開発時のみ：既存のテーブルを削除
      try {
        db.execSync('DROP TABLE IF EXISTS sessions;');
      } catch (e) {
        console.log('テーブル削除エラー:', e);
      }

      db.execSync(
        'CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, count INTEGER, calories REAL, height INTEGER, duration INTEGER);'
      );

      const result = db.getAllSync(
        'SELECT SUM(count) as totalSessions, SUM(calories) as totalCalories, SUM(height) as totalHeight FROM sessions;',
      );

      // クエリ結果を確認し、状態を更新
      if (result && result.length > 0) {
        const data = result[0] as SessionSummary;
        setTotalSessions(data.totalSessions || 1110);
        setTotalCalories(data.totalCalories || 0);
        setTotalHeight(data.totalHeight || 0);
      }
    });
  };

  useEffect(() => {
    initDatabase();
  }, []);

  const handleStart = () => {
    router.push('/session');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>階段ダイエット</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSessions}</Text>
            <Text style={styles.statLabel}>実施回数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalHeight}m</Text>
            <Text style={styles.statLabel}>登った高さ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCalories}kcal</Text>
            <Text style={styles.statLabel}>消費カロリー</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>スタート</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.subTitle}>使い方</Text>
          <Text style={styles.instructionText}>
            1. 「スタート」を押して計測開始{"\n"}
            2. 階段を1往復するごとにボタンを押す{"\n"}
            3. 終了時に結果を確認
          </Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  startButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  instructions: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});
