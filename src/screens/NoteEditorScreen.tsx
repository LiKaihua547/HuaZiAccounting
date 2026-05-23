import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotes, Note } from '../context/NoteContext';

const NoteEditorScreen = ({ route, navigation }: any) => {
  const { addNote, updateNote } = useNotes();
  const note: Note | null = route.params?.note;
  const isEdit = note !== null;

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('提示', '请输入标题');
      return;
    }
    if (isEdit) {
      updateNote(note.id, trimmedTitle, content.trim());
    } else {
      addNote(trimmedTitle, content.trim());
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? '编辑笔记' : '新建笔记'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark" size={28} color="#2A9D8F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="标题"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="写点什么..."
          placeholderTextColor="#bbb"
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />
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
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E6ED',
    paddingBottom: 10,
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 300,
    lineHeight: 24,
  },
});

export default NoteEditorScreen;