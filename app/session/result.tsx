import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SQLite from 'expo-sqlite';

export default function Result() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { date, count, duration, height, calories } = params;

  const handleSave = () => {
    const db = SQLite.openDatabaseSync('kaidandiet.db');
    db.withTransactionSync(() => {
      db.runSync(
        'INSERT INTO sessions (date, count, calories, height, duration) VALUES (?, ?, ?, ?, ?)',
        [
          date as string,
          Number(count),
          Number(calories),
          Number(height),
          Number(duration)
        ]
      );
    });
    router.replace('/(tabs)');
  };

  const handleDiscard = () => {
    Alert.alert(
      "確認",
      "今回の記録は保存されません。このままダイエットを終了しますか？",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "終了",
          onPress: () => {
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>おつかれさまでした!!</Text>
          
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>結果</Text>
            
            <View style={styles.resultItem}>
              <Text style={styles.label}>ダイエット時間</Text>
              <Text style={styles.value}>{formatDuration(Number(duration))}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.label}>往復した回数</Text>
              <Text style={styles.value}>{count}回</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.label}>登った高さ</Text>
              <Text style={styles.value}>{height}m</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.label}>消費カロリー</Text>
              <Text style={styles.value}>{calories}kcal</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>保存してHomeに戻る</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.discardButton]}
              onPress={handleDiscard}
            >
              <Text style={styles.buttonText}>保存せずに終了する</Text>
            </TouchableOpacity>
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
    marginBottom: 40,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultItem: {
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
  buttonContainer: {
    marginTop: 40,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 15,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  discardButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 