import { Calendar } from 'react-native-calendars';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { SessionSummary, MarkedDates, DayObject, SessionDateRow } from '@/types';
import { useFocusEffect } from '@react-navigation/native';

type SessionData = {
  totalCount: number;
  totalCalories: number;
  totalHeight: number;
  totalDuration: number;
};

export default function Record() {
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [calendarKey, setCalendarKey] = useState(0);

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

  // タブ切り替え時にカレンダーの表示を更新
  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().split('T')[0];
      setCurrentMonth(today);
      setSelectedDate(today);
      handleDayPress({ dateString: today } as DayObject);
      setCalendarKey(prev => prev + 1);
    }, [])
  );

  // 初期表示時に当日のデータを表示
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    handleDayPress({ dateString: today } as DayObject);
  }, []);

  // カレンダーの表示を更新
  useEffect(() => {
    if (selectedDate) {
      const db = SQLite.openDatabaseSync('kaidandiet.db');
      db.withTransactionSync(() => {
        // 選択した日付のセッションを集計
        const result = db.getAllSync(
          `SELECT
            SUM(count) as totalCount,
            SUM(calories) as totalCalories,
            SUM(height) as totalHeight,
            SUM(duration) as totalDuration
          FROM sessions
          WHERE date = ?;`,
          [selectedDate]
        ) as SessionData[];

        if (result && result.length > 0 && result[0].totalCount) {
          const data = result[0];
          setSessionSummary({
            totalCount: data.totalCount,
            totalCalories: data.totalCalories,
            totalHeight: data.totalHeight,
            totalDuration: data.totalDuration,
            sessions: [{ duration: data.totalDuration }]
          });
        } else {
          setSessionSummary(null);
        }
      });
    }
  }, [selectedDate]);

  const handleDayPress = (day: DayObject) => {
    setSelectedDate(day.dateString);
  };

  // 時間のフォーマット
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = '';
    if (hours > 0) {
      result += `${hours}時間`;
    }
    if (minutes > 0 || hours > 0) {
      result += `${minutes}分`;
    }
    result += `${secs}秒`;

    return result;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Calendar
            key={calendarKey}
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
            monthFormat="yyyy年MM月"
            dayNames={['日', '月', '火', '水', '木', '金', '土']}
            current={currentMonth}
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
                <Text style={styles.value}>{sessionSummary.totalCount}回</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
