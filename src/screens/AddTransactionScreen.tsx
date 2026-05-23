import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTransactions } from '../context/TransactionContext';
import { expenseCategories, incomeCategories, Transaction } from '../types/transaction';

const AddTransactionScreen = ({ navigation }: any) => {
  const { addTransaction } = useTransactions();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(expenseCategories[0].label);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDateTime(prev => new Date(date.getFullYear(), date.getMonth(), date.getDate(), prev.getHours(), prev.getMinutes()));
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedDateTime(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), date.getHours(), date.getMinutes()));
    }
  };

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('请输入有效金额');
      return;
    }
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      category: selectedCategory,
      amount: amt,
      date: selectedDateTime.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      datetime: selectedDateTime.toISOString(),
      note: note || selectedCategory,
    };
    addTransaction(newTransaction);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>记一笔</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 类型切换 */}
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
            onPress={() => {
              setType('expense');
              setSelectedCategory(expenseCategories[0].label);
            }}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>支出</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
            onPress={() => {
              setType('income');
              setSelectedCategory(incomeCategories[0].label);
            }}
          >
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>收入</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>分类</Text>
        <View style={styles.categoriesWrap}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.label}
              style={[styles.categoryItem, selectedCategory === cat.label && styles.categoryItemActive]}
              onPress={() => setSelectedCategory(cat.label)}
            >
              <Ionicons name={cat.icon as any} size={22} color={selectedCategory === cat.label ? '#fff' : '#666'} />
              <Text style={[styles.catLabel, selectedCategory === cat.label && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>金额</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>¥</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#ccc"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.sectionTitle}>备注</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="写点什么..."
          placeholderTextColor="#ccc"
          value={note}
          onChangeText={setNote}
        />

        {/* 日期时间选择 */}
        <Text style={styles.sectionTitle}>日期与时间</Text>
        <View style={styles.datetimeRow}>
          <TouchableOpacity style={styles.datetimeBtn} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.datetimeText}>
              {selectedDateTime.toLocaleDateString('zh-CN')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.datetimeBtn} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.datetimeText}>
              {selectedDateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDateTime}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDateTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>保存</Text>
        </TouchableOpacity>
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
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  typeRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 24,
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 3,
  },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#E76F51' },
  typeBtnActiveIncome: { backgroundColor: '#2A9D8F' },
  typeText: { fontSize: 16, fontWeight: '600', color: '#888' },
  typeTextActive: { color: '#fff' },
  sectionTitle: { fontSize: 15, color: '#666', marginBottom: 12, fontWeight: '500' },
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryItemActive: { backgroundColor: '#2A9D8F', borderColor: '#2A9D8F' },
  catLabel: { fontSize: 14, color: '#666', marginLeft: 6 },
  catLabelActive: { color: '#fff' },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 56,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  currency: { fontSize: 24, fontWeight: '600', color: '#333', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 24, fontWeight: '600', color: '#333' },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  datetimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  datetimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  datetimeText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
  saveBtn: {
    backgroundColor: '#2A9D8F',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2A9D8F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default AddTransactionScreen;