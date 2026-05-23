import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { useUser } from '../context/UserContext';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import type { Transaction } from '../types/transaction';

const HomeScreen = ({ navigation }: any) => {
  const { transactions } = useTransactions();
  const { appTitle } = useUser();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePressTransaction = (item: Transaction) => {
    navigation.navigate('EditTransaction', { transaction: item });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{appTitle}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.addBtn}
        >
          <Ionicons name="add-circle" size={46} color="#2A9D8F" />
        </TouchableOpacity>
      </View>

      <SummaryCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        onIncomePress={() => navigation.navigate('Summary', { type: 'income' })}
        onExpensePress={() => navigation.navigate('Summary', { type: 'expense' })}
      />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>近期交易</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionItem item={item} onPress={handlePressTransaction} />
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F6FA',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A2E' },
  addBtn: {
    padding: 6,
  },
  listHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
});

export default HomeScreen;