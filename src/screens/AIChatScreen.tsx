import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 根据用户名生成彩色头像背景
const getColorFromName = (name: string) => {
  const colors = ['#F4A261', '#2A9D8F', '#E76F51', '#E9C46A', '#264653', '#6A4C93'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AIChatScreen = ({ navigation }: any) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: `你好！我是记账小助手，可以帮你分析开销、记录账单。`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [deepThinking, setDeepThinking] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputBottom = useRef(new Animated.Value(10)).current;

  // 键盘动画：输入框上移 / 归位
  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        Animated.timing(inputBottom, {
          toValue: e.endCoordinates.height + 20,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(inputBottom, {
          toValue: 10,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // 发送消息
  const handleSend = () => {
    const text = input.trim();
    if (text.length === 0) return;

    const now = new Date().toISOString();
    // 1. 添加用户消息
    const userMsg = { id: Date.now().toString(), text, sender: 'user', timestamp: now };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    Keyboard.dismiss();

    // 2. 模拟 AI 默认回复
    setTimeout(() => {
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: `收到！“${text}”的功能正在开发中，敬请期待！`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  // 动态用户头像
  const UserAvatar = () => {
    const username = user?.username || 'U';
    const initials = username.slice(0, 2).toUpperCase();
    const bgColor = getColorFromName(username);
    if (user?.avatar) {
      return <Image source={{ uri: user.avatar }} style={styles.avatarImage} />;
    }
    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: bgColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: any) => {
    const isUser = item.sender === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow]}>
        {/* AI 头像（左） */}
        {!isUser && (
          <View style={styles.avatarBox}>
            <Ionicons name="sparkles" size={22} color="#2A9D8F" />
          </View>
        )}
        <View>
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.msgText, isUser ? styles.userText : styles.aiText]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timeText, isUser ? styles.userTime : styles.aiTime]}>{time}</Text>
        </View>
        {/* 用户头像（右） */}
        {isUser && (
          <View style={styles.avatarBox}>
            <UserAvatar />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>记账小助手</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 底部输入区域 */}
      <Animated.View style={[styles.inputContainer, { bottom: inputBottom }]}>
        <TextInput
          style={styles.textInput}
          placeholder="输入记账或查询..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              style={[styles.decorBtn, deepThinking && styles.decorBtnActive]}
              onPress={() => setDeepThinking(!deepThinking)}
            >
              <Ionicons name="bulb" size={14} color={deepThinking ? '#fff' : '#666'} />
              <Text style={[styles.decorText, deepThinking && styles.decorTextActive]}>深度思考</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.decorBtn, webSearch && styles.decorBtnActive]}
              onPress={() => setWebSearch(!webSearch)}
            >
              <Ionicons name="globe" size={14} color={webSearch ? '#fff' : '#666'} />
              <Text style={[styles.decorText, webSearch && styles.decorTextActive]}>联网搜索</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F6FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1A1A2E' },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 150,
    flexGrow: 1,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  avatarBox: { marginHorizontal: 6 },
  avatarImage: { width: 32, height: 32, borderRadius: 16 },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.7,
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#2A9D8F',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  msgText: { fontSize: 15, lineHeight: 21 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  timeText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    marginHorizontal: 8,
  },
  userTime: { textAlign: 'right' },
  aiTime: { textAlign: 'left' },
  inputContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  textInput: {
    fontSize: 15,
    color: '#333',
    maxHeight: 80,
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  decorBtnActive: { backgroundColor: '#2A9D8F' },
  decorText: { fontSize: 12, color: '#666' },
  decorTextActive: { color: '#fff' },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A9D8F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIChatScreen;