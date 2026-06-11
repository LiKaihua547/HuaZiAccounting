import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from '../context/TransactionContext';
import { useUser } from '../context/UserContext';
import SummaryCard from '../components/SummaryCard';
import TransactionItem from '../components/TransactionItem';
import type { Transaction } from '../types/transaction';

const PAGE_SIZE = 10;

const HomeScreen = ({ navigation }: any) => {
  const { transactions } = useTransactions();
  const { appTitle } = useUser();

  // 当前选择年月（默认本月）
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [showPicker, setShowPicker] = useState(false);

  // 筛选本月交易，并按时间倒序
  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        const d = new Date(t.datetime);
        return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
      })
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }, [transactions, selectedYear, selectedMonth]);

  // 当前月份的总收支
  const totalIncome = useMemo(
    () => filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [filtered]
  );

  // 当前展示的列表数据
  const displayed = useMemo(() => filtered.slice(0, displayCount), [filtered, displayCount]);

  // 是否还有更多数据
  const hasMore = displayCount < filtered.length;

  const handlePressTransaction = (item: Transaction) => {
    navigation.navigate('EditTransaction', { transaction: item });
  };

  // 切换年月时重置分页
  const onDateChange = (_: any, date?: Date) => {
    if (date) {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
      setDisplayCount(PAGE_SIZE);
    }
    setShowPicker(false);
  };

  // 加载更多
  const loadMore = () => {
    setDisplayCount(prev => prev + PAGE_SIZE);
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

      {/* 列表标题 + 年月选择 */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>近期交易</Text>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.monthText}>
            {selectedYear}年{selectedMonth}月
          </Text>
          <Ionicons name="calendar-outline" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TransactionItem item={item} onPress={handlePressTransaction} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
              <Text style={styles.loadMoreText}>查看更多</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* 年月选择器 */}
      {showPicker && (
        <DateTimePicker
          value={new Date(selectedYear, selectedMonth - 1, 1)}
          mode="date"
          display="spinner"
          onChange={onDateChange}
        />
      )}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  addBtn: {
    padding: 6,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  monthText: {
    fontSize: 13,
    color: '#666',
  },
  listContent: {
    paddingBottom: 100,
  },
  loadMoreBtn: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#2A9D8F',
    fontWeight: '500',
  },
});

export default HomeScreen;