import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
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
}

const NoteContext = createContext<NoteContextProps>({
  notes: [],
  addNote: () => {},
  updateNote: () => {},
  deleteNote: () => {},
  moveUp: () => {},
  moveDown: () => {},
});

export const useNotes = () => useContext(NoteContext);

const allNotes: Record<string, Note[]> = {};

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const username = user?.username || 'guest';

  const [notes, setNotes] = useState<Note[]>(() => allNotes[username] || []);

  const sync = (newList: Note[]) => {
    allNotes[username] = newList;
    setNotes(newList);
  };

  const addNote = useCallback((title: string, content: string) => {
    const now = Date.now();
    const newNote: Note = {
      id: now.toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      order: now,
    };
    sync([newNote, ...notes]);
  }, [notes, username]);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, title, content } : n);
    sync(updated);
  }, [notes, username]);

  const deleteNote = useCallback((id: string) => {
    sync(notes.filter(n => n.id !== id));
  }, [notes, username]);

  const moveUp = useCallback((id: string) => {
    setNotes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index <= 0) return prev;
      const newList = [...prev];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      allNotes[username] = newList;
      return newList;
    });
  }, [username]);

  const moveDown = useCallback((id: string) => {
    setNotes(prev => {
      const index = prev.findIndex(n => n.id === id);
      if (index < 0 || index >= prev.length - 1) return prev;
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      allNotes[username] = newList;
      return newList;
    });
  }, [username]);

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote, moveUp, moveDown }}>
      {children}
    </NoteContext.Provider>
  );
};