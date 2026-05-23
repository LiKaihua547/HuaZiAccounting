import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTransactions } from '../context/TransactionContext';

const screenWidth = Dimensions.get('window').width;

const SummaryScreen = ({ route, navigation }: any) => {
  const { type } = route.params; // 'income' 或 'expense'
  const { transactions } = useTransactions();

  const now = new Date();
  // 默认筛选：本年、本月，不选日
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // 筛选交易
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== type) return false;
      const d = new Date(t.datetime);
      if (d.getFullYear() !== selectedYear) return false;
      if (selectedMonth && d.getMonth() + 1 !== selectedMonth) return false;
      if (selectedDay && d.getDate() !== selectedDay) return false;
      return true;
    });
  }, [transactions, type, selectedYear, selectedMonth, selectedDay]);

  // 分类汇总
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const colors = ['#2A9D8F', '#E76F51', '#F4A261', '#E9C46A', '#264653', '#A8DADC', '#457B9D', '#6D6875'];
    return Object.entries(map).map(([name, value], index) => ({
      name,
      amount: value,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    }));
  }, [filtered]);

  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  const chartData = categoryData.map(item => ({
    name: item.name,
    population: item.amount,
    color: item.color,
    legendFontColor: item.legendFontColor,
    legendFontSize: item.legendFontSize,
  }));

  const avgPerCategory = categoryData.length > 0 ? totalAmount / categoryData.length : 0;
  const maxCategory = categoryData.reduce((max, c) => c.amount > max.amount ? c : max, { name: '', amount: 0 });

  // ---------- 日期选择器回调 ----------
  const onYearChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowYearPicker(false);
    if (date) {
      setSelectedYear(date.getFullYear());
    }
  };

  const onMonthChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowMonthPicker(false);
    if (date) {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
    }
  };

  const onDayChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDayPicker(false);
    if (date) {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
      setSelectedDay(date.getDate());
    }
  };

  // 用于打开年月日选择器时的初始值
  const openYearPicker = () => {
    setTempDate(new Date(selectedYear, 0, 1));
    setShowYearPicker(true);
  };

  const openMonthPicker = () => {
    setTempDate(new Date(selectedYear, (selectedMonth || 1) - 1, 1));
    setShowMonthPicker(true);
  };

  const openDayPicker = () => {
    setTempDate(new Date(selectedYear, (selectedMonth || 1) - 1, selectedDay || 1));
    setShowDayPicker(true);
  };

  // 清除月份和日期筛选（回到本年本月，但月份已是当月，我们给一个“全部”按钮把月份和日都置null）
  const clearMonthAndDay = () => {
    setSelectedMonth(null as any);
    setSelectedDay(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{type === 'income' ? '收入' : '支出'}分析</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 筛选栏 */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn} onPress={openYearPicker}>
            <Text style={styles.filterBtnText}>{selectedYear}年</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={openMonthPicker}>
            <Text style={styles.filterBtnText}>
              {selectedMonth ? `${selectedMonth}月` : '全部月份'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={openDayPicker}>
            <Text style={styles.filterBtnText}>
              {selectedDay ? `${selectedDay}日` : '全部日期'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearBtn} onPress={clearMonthAndDay}>
            <Ionicons name="refresh" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 日期选择器 */}
        {showYearPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={onYearChange}
          />
        )}
        {showMonthPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={onMonthChange}
          />
        )}
        {showDayPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={onDayChange}
          />
        )}

        {/* 总额卡片 */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {selectedYear}年{selectedMonth ? ` ${selectedMonth}月` : ''}{selectedDay ? ` ${selectedDay}日` : ''} 总{type === 'income' ? '收入' : '支出'}
          </Text>
          <Text style={[styles.totalValue, { color: type === 'income' ? '#2A9D8F' : '#E76F51' }]}>
            ¥{totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* 饼图 */}
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <Text style={styles.empty}>暂无数据</Text>
        )}

        {/* 分析指数 */}
        {categoryData.length > 0 && (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>分类分析</Text>
            <Text style={styles.analysisText}>• 最高分类：{maxCategory.name} (¥{maxCategory.amount.toFixed(2)})</Text>
            <Text style={styles.analysisText}>• 平均每类：¥{avgPerCategory.toFixed(2)}</Text>
            <Text style={styles.analysisText}>• 交易笔数：{filtered.length}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F6FA', paddingTop: 30 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A2E' },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  filterBtnText: {
    fontSize: 14,
    color: '#333',
  },
  clearBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginLeft: 'auto',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  totalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  totalLabel: { fontSize: 15, color: '#888', marginBottom: 4 },
  totalValue: { fontSize: 36, fontWeight: '800' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  analysisCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  analysisTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  analysisText: { fontSize: 15, color: '#555', marginBottom: 8 },
});

export default SummaryScreen;