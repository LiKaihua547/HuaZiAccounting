import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  FlatList, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotes, Note } from '../context/NoteContext';
import { useUser } from '../context/UserContext';

const NoteListScreen = ({ navigation }: any) => {
  const { notes, deleteNote, moveUp, moveDown } = useNotes();
  const { noteTitle } = useUser();

  const handlePressNote = (note: Note) => {
    navigation.navigate('NoteEditor', { note });
  };

  const handleDelete = (id: string) => {
    Alert.alert('删除', '确定删除这条笔记吗？', [
      { text: '取消' },
      { text: '删除', style: 'destructive', onPress: () => deleteNote(id) },
    ]);
  };

  const renderItem = ({ item, index }: { item: Note; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === notes.length - 1;

    return (
      <View style={styles.noteItem}>
        <TouchableOpacity
          style={styles.noteContent}
          onPress={() => handlePressNote(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.noteDate}>
            {new Date(item.createdAt).toLocaleString('zh-CN')}
          </Text>
          <Text style={styles.notePreview} numberOfLines={2}>{item.content}</Text>
        </TouchableOpacity>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.moveBtn}
            disabled={isFirst}
            onPress={() => moveUp(item.id)}
          >
            <Ionicons name="chevron-up" size={20} color={isFirst ? '#ccc' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moveBtn}
            disabled={isLast}
            onPress={() => moveDown(item.id)}
          >
            <Ionicons name="chevron-down" size={20} color={isLast ? '#ccc' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#E76F51" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{noteTitle}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.addBtn}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('NoteEditor', { note: null })}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A2E' },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  noteContent: { flex: 1 },
  noteTitle: { fontSize: 17, fontWeight: '600', color: '#333', marginBottom: 4 },
  noteDate: { fontSize: 12, color: '#999', marginBottom: 6 },
  notePreview: { fontSize: 14, color: '#666' },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  moveBtn: { paddingVertical: 2, paddingHorizontal: 4 },
  deleteBtn: { padding: 6, marginTop: 4 },
  addBtn: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F4A261',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F4A261',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

export default NoteListScreen;