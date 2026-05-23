import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '../types/transaction';
import { useUser } from './UserContext';

interface ContextProps {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionContext = createContext<ContextProps>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
});

export const useTransactions = () => useContext(TransactionContext);

// 内存存储，按用户名隔离
const allTransactions: Record<string, Transaction[]> = {};

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const username = user?.username || 'guest';

  const [transactions, setTransactions] = useState<Transaction[]>(
    () => allTransactions[username] || getDefaultTransactions(username)
  );

  const sync = (newList: Transaction[]) => {
    allTransactions[username] = newList;
    setTransactions(newList);
  };

  const addTransaction = (t: Transaction) => {
    sync([t, ...transactions]);
  };

  const updateTransaction = (id: string, data: Partial<Transaction>) => {
    const updated = transactions.map(item =>
      item.id === id ? { ...item, ...data } : item
    );
    sync(updated);
  };

  const deleteTransaction = (id: string) => {
    sync(transactions.filter(item => item.id !== id));
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, updateTransaction, deleteTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

// 默认示例数据
function getDefaultTransactions(username: string): Transaction[] {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const dateStr = (d: Date) =>
    d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 12, 30);
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 10, 0);
  const d3 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18, 20);
  const d4 = new Date(now.getFullYear(), now.getMonth() - 1, 10, 15, 45);
  const d5 = new Date(now.getFullYear(), now.getMonth() - 1, 1, 9, 15);

  return [
    {
      id: '1',
      type: 'expense',
      category: '餐饮',
      amount: 48.5,
      date: dateStr(d1),
      datetime: iso(d1),
      note: '午餐外卖',
    },
    {
      id: '2',
      type: 'income',
      category: '工资',
      amount: 15000,
      date: dateStr(d2),
      datetime: iso(d2),
      note: '5月工资',
    },
    {
      id: '3',
      type: 'expense',
      category: '交通',
      amount: 12,
      date: dateStr(d3),
      datetime: iso(d3),
      note: '地铁通勤',
    },
    {
      id: '4',
      type: 'expense',
      category: '购物',
      amount: 329,
      date: dateStr(d4),
      datetime: iso(d4),
      note: '买书',
    },
    {
      id: '5',
      type: 'income',
      category: '兼职',
      amount: 2000,
      date: dateStr(d5),
      datetime: iso(d5),
      note: '周末兼职',
    },
  ];
}