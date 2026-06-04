import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  order: number;
}

interface NoteContextProps {
  notes: Note[];
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  isLoading: boolean;
}

const NoteContext = createContext<NoteContextProps>({
  notes: [],
  addNote: () => {},
  updateNote: () => {},
  deleteNote: () => {},
  moveUp: () => {},
  moveDown: () => {},
  isLoading: true,
});

export const useNotes = () => useContext(NoteContext);

const STORAGE_KEY_PREFIX = '@notes_';

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const username = user?.username || 'guest';
  const storageKey = `${STORAGE_KEY_PREFIX}${username}`;

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从 AsyncStorage 加载
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          setNotes(JSON.parse(stored));
        }
      } catch (error) {
        console.error('加载笔记数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotes();
  }, [username]);

  // 保存到 AsyncStorage
  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newNotes));
    } catch (error) {
      console.error('保存笔记数据失败:', error);
    }
  };

  const addNote = useCallback(async (title: string, content: string) => {
    const now = Date.now();
    const newNote: Note = {
      id: now.toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      order: now,
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    await saveNotes(updated);
  }, [notes, username]);

  const updateNote = useCallback(async (id: string, title: string, content: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, title, content } : n);
    setNotes(updated);
    await saveNotes(updated);
  }, [notes, username]);

  const deleteNote = useCallback(async (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    await saveNotes(updated);
  }, [notes, username]);

  const moveUp = useCallback(async (id: string) => {
    setNotes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index <= 0) return prev;
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      saveNotes(newList);
      return newList;
    });
  }, [username]);

  const moveDown = useCallback(async (id: string) => {
    setNotes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      saveNotes(newList);
      return newList;
    });
  }, [username]);

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote, moveUp, moveDown, isLoading }}>
      {children}
    </NoteContext.Provider>
  );
};