import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;
  password: string;
  avatar: string | null;
  nickname: string;   // 用户昵称，默认 "华子"
}

interface UserContextProps {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  nickname: string;
  updateNickname: (nickname: string) => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAvatar: (uri: string) => void;
  changePassword: (oldPwd: string, newPwd: string) => boolean;
  // 派生标题
  appTitle: string;      // 记账本名称，由昵称生成
  noteTitle: string;     // 记事本标题，由昵称生成
}

const UserContext = createContext<UserContextProps>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  nickname: '华子',
  updateNickname: () => {},
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateAvatar: () => {},
  changePassword: () => false,
  appTitle: '华子记账本',
  noteTitle: '华子记事本',
});

export const useUser = () => useContext(UserContext);

const USERS_STORAGE_KEY = '@users_data';
const SESSION_KEY = '@current_user';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：加载用户并恢复会话
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
        let usersList: User[] = stored ? JSON.parse(stored) : [];
        
        // 兼容旧数据：如果没有 nickname，根据旧的 appTitle 提取或设为默认
        usersList = usersList.map(u => ({
          ...u,
          nickname: u.nickname || extractNickname(u as any),
        }));

        if (usersList.length === 0) {
          // 创建默认测试账号
          usersList.push({
            username: 'test',
            password: '123456',
            avatar: null,
            nickname: '华子',
          });
        }
        
        await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
        setUsers(usersList);

        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) {
          const loggedInUser = usersList.find(u => u.username === session);
          if (loggedInUser) setUser(loggedInUser);
        }
      } catch (e) {
        console.error('加载用户数据失败:', e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // 从旧数据提取昵称（兼容旧版 appTitle 字段）
  const extractNickname = (oldUser: any): string => {
    if (oldUser.appTitle && oldUser.appTitle.endsWith('记账本')) {
      return oldUser.appTitle.replace('记账本', '');
    }
    if (oldUser.noteTitle && oldUser.noteTitle.endsWith('记事本')) {
      return oldUser.noteTitle.replace('记事本', '');
    }
    return '华子';
  };

  const saveUsers = async (newUsers: User[]) => {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
    } catch (e) {
      console.error('保存用户数据失败:', e);
    }
  };

  const updateCurrentUser = async (updatedUser: User) => {
    setUser(updatedUser);
    const updatedUsers = users.map(u => u.username === updatedUser.username ? updatedUser : u);
    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setUser(found);
      await AsyncStorage.setItem(SESSION_KEY, username);
      return true;
    }
    return false;
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    if (users.find(u => u.username === username)) return false;
    const newUser: User = {
      username,
      password,
      avatar: null,
      nickname: '华子',   // 新用户默认昵称
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
    setUser(newUser);
    await AsyncStorage.setItem(SESSION_KEY, username);
    return true;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const updateAvatar = (uri: string) => {
    if (!user) return;
    const updated = { ...user, avatar: uri };
    updateCurrentUser(updated);
  };

  const changePassword = (oldPwd: string, newPwd: string) => {
    if (!user || user.password !== oldPwd) return false;
    const updated = { ...user, password: newPwd };
    updateCurrentUser(updated);
    return true;
  };

  const updateNickname = (nickname: string) => {
    if (!user) return;
    const updated = { ...user, nickname };
    updateCurrentUser(updated);
  };

  // 派生属性：根据昵称生成标题
  const nickname = user?.nickname || '华子';
  const appTitle = `${nickname}记账本`;
  const noteTitle = `${nickname}记事本`;

  return (
  <UserContext.Provider
  value={{
    user,
    isLoggedIn: !!user,
    isLoading,
    nickname: user?.nickname || '华子',
    updateNickname,
    login,
    register,
    logout,
    updateAvatar,
    changePassword,
    appTitle: user?.nickname ? `${user.nickname}记账本` : '华子记账本',
    noteTitle: user?.nickname ? `${user.nickname}记事本` : '华子记事本',
  }}
>
  {children}
</UserContext.Provider>
  );
};