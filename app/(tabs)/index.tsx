import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet, TextInput, ScrollView } from "react-native";
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from "react";
import { SessionSummary } from '@/types';
import { useRouter } from 'expo-router';

type StairInfo = {
  stepHeight: number;
  stepCount: number;
};

type StairInfoRow = {
  step_height: number;
  step_count: number;
};

export default function Index() {
  const router = useRouter();
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalHeight, setTotalHeight] = useState(0);
  const [stairInfo, setStairInfo] = useState<StairInfo>({ stepHeight: 20, stepCount: 15 });
  const [editedStairInfo, setEditedStairInfo] = useState<StairInfo>({ stepHeight: 20, stepCount: 15 });
  const [showSaveButton, setShowSaveButton] = useState(false);

  const initDatabase = () => {
    const db = SQLite.openDatabaseSync('kaidandiet.db');

    db.withTransactionSync(() => {
      // 開発時のみ：既存のテーブルを削除
      try {
        db.execSync('DROP TABLE IF EXISTS sessions;');
        db.execSync('DROP TABLE IF EXISTS stair_info;');
      } catch (e) {
        console.log('テーブル削除エラー:', e);
      }

      // sessionsテーブルの作成
      db.execSync(
        'CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, count INTEGER, calories REAL, height INTEGER, duration INTEGER);'
      );

      // stair_infoテーブルの存在確認
      const tableExists = db.getAllSync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='stair_info';"
      );

      // テーブルが存在しない場合のみ作成と初期値挿入
      if (tableExists.length === 0) {
        db.execSync(
          'CREATE TABLE IF NOT EXISTS stair_info (id INTEGER PRIMARY KEY AUTOINCREMENT, step_height INTEGER, step_count INTEGER);'
        );
        db.runSync(
          'INSERT INTO stair_info (step_height, step_count) VALUES (?, ?)',
          [20, 15]
        );
      }

      // 階段情報の取得
      const stairResult = db.getAllSync('SELECT step_height, step_count FROM stair_info LIMIT 1;') as StairInfoRow[];
      if (stairResult && stairResult.length > 0) {
        setStairInfo({
          stepHeight: stairResult[0].step_height,
          stepCount: stairResult[0].step_count
        });
        setEditedStairInfo({
          stepHeight: stairResult[0].step_height,
          stepCount: stairResult[0].step_count
        });
      }

      // セッション情報の取得
      const sessionResult = db.getAllSync(
        'SELECT SUM(count) as totalSessions, SUM(calories) as totalCalories, SUM(height) as totalHeight FROM sessions;',
      );

      if (sessionResult && sessionResult.length > 0) {
        const data = sessionResult[0] as SessionSummary;
        setTotalSessions(data.totalCount || 0);
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

  const handleStairInfoChange = (field: keyof StairInfo, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedStairInfo(prev => ({
      ...prev,
      [field]: numValue
    }));
    setShowSaveButton(true);
  };

  const handleSaveStairInfo = () => {
    const db = SQLite.openDatabaseSync('kaidandiet.db');
    db.withTransactionSync(() => {
      db.runSync(
        'UPDATE stair_info SET step_height = ?, step_count = ? WHERE id = 1',
        [editedStairInfo.stepHeight, editedStairInfo.stepCount]
      );
    });
    setStairInfo(editedStairInfo);
    setShowSaveButton(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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

          <View style={styles.stairInfoContainer}>
            <Text style={styles.subTitle}>自宅の階段</Text>
            <View style={styles.stairInfoItem}>
              <Text style={styles.stairInfoLabel}>1段の高さ：</Text>
              <TextInput
                style={styles.stairInfoInput}
                value={editedStairInfo.stepHeight.toString()}
                onChangeText={(value) => handleStairInfoChange('stepHeight', value)}
                keyboardType="numeric"
              />
              <Text style={styles.stairInfoUnit}>cm</Text>
            </View>
            <View style={styles.stairInfoItem}>
              <Text style={styles.stairInfoLabel}>段数：</Text>
              <TextInput
                style={styles.stairInfoInput}
                value={editedStairInfo.stepCount.toString()}
                onChangeText={(value) => handleStairInfoChange('stepCount', value)}
                keyboardType="numeric"
              />
              <Text style={styles.stairInfoUnit}>段</Text>
            </View>
            {showSaveButton && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveStairInfo}
              >
                <Text style={styles.buttonText}>変更する</Text>
              </TouchableOpacity>
            )}
          </View>
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
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 20,
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
  stairInfoContainer: {
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
  stairInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stairInfoLabel: {
    fontSize: 16,
    color: '#666',
    width: 100,
  },
  stairInfoInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    width: 80,
    textAlign: 'right',
    marginRight: 10,
  },
  stairInfoUnit: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
});
