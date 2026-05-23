import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  totalIncome: number;
  totalExpense: number;
  onIncomePress?: () => void;
  onExpensePress?: () => void;
}

const SummaryCard: React.FC<Props> = ({ totalIncome, totalExpense, onIncomePress, onExpensePress }) => {
  const balance = totalIncome - totalExpense;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>本月概览</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.item} onPress={onIncomePress} activeOpacity={0.7}>
          <Text style={styles.label}>收入</Text>
          <Text style={[styles.value, styles.income]}>¥{totalIncome.toFixed(2)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={onExpensePress} activeOpacity={0.7}>
          <Text style={styles.label}>支出</Text>
          <Text style={[styles.value, styles.expense]}>¥{totalExpense.toFixed(2)}</Text>
        </TouchableOpacity>
        <View style={styles.item}>
          <Text style={styles.label}>结余</Text>
          <Text style={[styles.value, { color: balance >= 0 ? '#2A9D8F' : '#E76F51' }]}>
            ¥{balance.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  income: { color: '#2A9D8F' },
  expense: { color: '#E76F51' },
});

export default SummaryCard;