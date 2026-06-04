import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/transaction';
import { useUser } from './UserContext';

interface ContextProps {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;  // 数据加载状态
}

const TransactionContext = createContext<ContextProps>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  isLoading: true,
});

export const useTransactions = () => useContext(TransactionContext);

// AsyncStorage 的 key 前缀
const STORAGE_KEY_PREFIX = '@transactions_';

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const username = user?.username || 'guest';
  const storageKey = `${STORAGE_KEY_PREFIX}${username}`;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从 AsyncStorage 加载数据
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          setTransactions(JSON.parse(stored));
        } else {

        }
      } catch (error) {
        console.error('加载交易数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTransactions();
  }, [username]); // 切换用户时重新加载

  // 保存到 AsyncStorage
  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newTransactions));
    } catch (error) {
      console.error('保存交易数据失败:', error);
    }
  };

  const addTransaction = async (t: Transaction) => {
    const updated = [t, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const updated = transactions.map(item =>
      item.id === id ? { ...item, ...data } : item
    );
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const deleteTransaction = async (id: string) => {
    const updated = transactions.filter(item => item.id !== id);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, updateTransaction, deleteTransaction, isLoading }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
