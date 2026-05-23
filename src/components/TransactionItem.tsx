import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types/transaction';
import { expenseCategories, incomeCategories } from '../types/transaction';

interface Props {
  item: Transaction;
  onPress: (item: Transaction) => void;
}

const TransactionItem: React.FC<Props> = ({ item, onPress }) => {
  const categories = item.type === 'expense' ? expenseCategories : incomeCategories;
  const categoryObj = categories.find(c => c.label === item.category);
  const icon = categoryObj?.icon || 'ellipse-outline';

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={22} color="#fff" />
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.note} numberOfLines={1}>{item.note}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={[styles.amount, item.type === 'income' ? styles.income : styles.expense]}>
        {item.type === 'income' ? '+' : '-'}¥{item.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2A9D8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  category: { fontSize: 16, fontWeight: '600', color: '#333' },
  note: { fontSize: 13, color: '#999', marginTop: 2 },
  date: { fontSize: 12, color: '#bbb', marginTop: 4 },
  amount: { fontSize: 17, fontWeight: '700' },
  income: { color: '#2A9D8F' },
  expense: { color: '#E76F51' },
});

export default TransactionItem;