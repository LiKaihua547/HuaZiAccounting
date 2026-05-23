export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
}
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;          // 用于显示，如 "05-23 14:30"
  datetime: string;      // 完整时间，用于排序和筛选
  note: string;
}
// 预设分类及图标
export const expenseCategories = [
  { label: '餐饮', icon: 'fast-food-outline' },
  { label: '交通', icon: 'bus-outline' },
  { label: '购物', icon: 'cart-outline' },
  { label: '娱乐', icon: 'game-controller-outline' },
  { label: '居家', icon: 'home-outline' },
  { label: '医疗', icon: 'medkit-outline' },
];

export const incomeCategories = [
  { label: '工资', icon: 'cash-outline' },
  { label: '兼职', icon: 'briefcase-outline' },
  { label: '理财', icon: 'trending-up-outline' },
  { label: '红包', icon: 'gift-outline' },
];