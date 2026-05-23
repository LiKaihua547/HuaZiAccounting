import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  password: string;
  avatar: string | null;
  appTitle: string;          // 记账本名称
  noteTitle: string;         // 记事本标题
}

interface UserContextProps {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
  updateAvatar: (uri: string) => void;
  changePassword: (oldPwd: string, newPwd: string) => boolean;
  appTitle: string;
  updateAppTitle: (title: string) => void;
  noteTitle: string;
  updateNoteTitle: (title: string) => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  isLoggedIn: false,
  login: () => false,
  register: () => false,
  logout: () => {},
  updateAvatar: () => {},
  changePassword: () => false,
  appTitle: '华子记账本',
  updateAppTitle: () => {},
  noteTitle: '华子记事本',
  updateNoteTitle: () => {},
});

export const useUser = () => useContext(UserContext);

const mockUsers: User[] = [
  {
    username: 'test',
    password: '123456',
    avatar: null,
    appTitle: '华子记账本',
    noteTitle: '华子记事本',
  },
];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string) => {
    const found = mockUsers.find(u => u.username === username && u.password === password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const register = (username: string, password: string) => {
    if (mockUsers.find(u => u.username === username)) return false;
    const newUser: User = {
      username,
      password,
      avatar: null,
      appTitle: '华子记账本',
      noteTitle: '华子记事本',
    };
    mockUsers.push(newUser);
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  const updateAvatar = (uri: string) => {
    if (!user) return;
    const updated = { ...user, avatar: uri };
    updateUserInDB(updated);
  };

  const changePassword = (oldPwd: string, newPwd: string) => {
    if (!user || user.password !== oldPwd) return false;
    const updated = { ...user, password: newPwd };
    updateUserInDB(updated);
    return true;
  };

  const updateAppTitle = (title: string) => {
    if (!user) return;
    const updated = { ...user, appTitle: title };
    updateUserInDB(updated);
  };

  const updateNoteTitle = (title: string) => {
    if (!user) return;
    const updated = { ...user, noteTitle: title };
    updateUserInDB(updated);
  };

  const updateUserInDB = (updatedUser: User) => {
    const idx = mockUsers.findIndex(u => u.username === updatedUser.username);
    if (idx !== -1) mockUsers[idx] = updatedUser;
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        updateAvatar,
        changePassword,
        appTitle: user?.appTitle || '华子记账本',
        updateAppTitle,
        noteTitle: user?.noteTitle || '华子记事本',
        updateNoteTitle,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};