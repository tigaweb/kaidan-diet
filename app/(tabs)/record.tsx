import { Calendar } from 'react-native-calendars';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { SessionSummary, MarkedDates, DayObject, SessionDateRow } from '@/types';

type SessionData = {
  totalCount: number;
  totalCalories: number;
  totalHeight: number;
  start_times: string;
  end_times: string;
};

export default function Record() {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  // カレンダーのマーク付け日付を取得
  useEffect(() => {
    const db = SQLite.openDatabaseSync('kaidandiet.db');
    
    db.withTransactionSync(() => {
      // 記録のある日付を取得
      const result = db.getAllSync(
        'SELECT DISTINCT date as session_date FROM sessions;'
      ) as SessionDateRow[];
      
      const marks: MarkedDates = {};
      result.forEach((row) => {
        marks[row.session_date] = { marked: true };
      });
      
      setMarkedDates(marks);
    });
  }, []);

  // 日付選択時の処理
  const handleDayPress = (day: DayObject) => {
    setSelectedDate(day.dateString);
    
    const db = SQLite.openDatabaseSync('kaidandiet.db');
    db.withTransactionSync(() => {
      // 選択した日付の開始時刻のセッションを集計
      const result = db.getAllSync(
        `SELECT 
          SUM(count) as totalCount,
          SUM(calories) as totalCalories,
          SUM(height) as totalHeight,
          SUM(duration) as totalDuration
        FROM sessions 
        WHERE date = ?;`,
        [day.dateString]
      ) as SessionData[];
      
      if (result && result.length > 0 && result[0].totalCount) {
        const data = result[0];
        const start_times = data.start_times.split(',');
        const end_times = data.end_times.split(',');
        
        // セッション時間の合計を計算
        let totalDuration = 0;
        const sessions = start_times.map((start: string, index: number) => {
          const startTime = new Date(start);
          const endTime = new Date(end_times[index]);
          const duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60; // 分単位
          totalDuration += duration;
          return { start_time: start, end_time: end_times[index] };
        });

        setSessionSummary({
          totalSessions: data.totalCount,
          totalCalories: data.totalCalories,
          totalHeight: data.totalHeight,
          totalDuration,
          sessions
        });
      } else {
        setSessionSummary(null);
      }
    });
  };

  // 時間のフォーマット
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              selected: true,
              marked: markedDates[selectedDate]?.marked
            }
          }}
          theme={{
            selectedDayBackgroundColor: '#3498db',
            dotColor: '#3498db',
            todayTextColor: '#3498db'
          }}
        />
        
        {sessionSummary ? (
          <View style={styles.statsContainer}>
            <Text style={styles.title}>{selectedDate}の記録</Text>
            
            <View style={styles.statItem}>
              <Text style={styles.label}>トレーニング時間</Text>
              <Text style={styles.value}>
                {formatDuration(sessionSummary.totalDuration)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.label}>往復回数</Text>
              <Text style={styles.value}>{sessionSummary.totalSessions}回</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.label}>登った高さ</Text>
              <Text style={styles.value}>{sessionSummary.totalHeight}m</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.label}>消費カロリー</Text>
              <Text style={styles.value}>{sessionSummary.totalCalories}kcal</Text>
            </View>
          </View>
        ) : selectedDate ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {selectedDate}の記録はありません
            </Text>
          </View>
        ) : null}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
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
  noDataContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});
