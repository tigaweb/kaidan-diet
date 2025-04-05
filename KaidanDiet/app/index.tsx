import { Text, View, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
};

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalHeight, setTotalHeight] = useState(0);

  // TODO: 実際のデータ取得処理を実装
  useEffect(() => {
    // ローカルストレージから累計データを取得
    const mockData = {
      sessions: 12,
      calories: 45.6,
      height: 2400 // cm単位
    };
    setTotalSessions(mockData.sessions);
    setTotalCalories(mockData.calories);
    setTotalHeight(mockData.height);
  }, []);

  const handleStart = () => {
    navigation.navigate('Main');
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
