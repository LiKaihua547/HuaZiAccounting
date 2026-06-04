import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
  const { login, appTitle } = useUser(); // appTitle 会随着昵称改变而更新
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('提示', '请输入账号和密码');
      return;
    }
    const success = await login(username.trim(), password);
    if (!success) {
      Alert.alert('登录失败', '账号或密码错误');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* 顶部图标和标题 */}
        <View style={styles.brandWrap}>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet" size={44} color="#fff" />
          </View>
          <Text style={styles.brandTitle}>{appTitle}</Text> {/* 动态标题 */}
          <Text style={styles.brandSub}>掌握你的每一分钱</Text>
        </View>

        {/* 登录卡片 */}
        <View style={styles.card}>
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="用户名"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="密码"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginBtnText}>登 录</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountsLink}
            onPress={() => navigation.navigate('AccountList')}
          >
            <Ionicons name="people-outline" size={16} color="#2A9D8F" />
            <Text style={styles.accountsText}>查看所有账号</Text>
          </TouchableOpacity>
        </View>

        {/* 底部注册入口 */}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>没有账号？去注册</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A9D8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2A9D8F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1A1A2E',
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 15,
    color: '#7C7F88',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#EDEFF2',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loginBtn: {
    backgroundColor: '#2A9D8F',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#2A9D8F',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  accountsLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  accountsText: {
    color: '#2A9D8F',
    fontSize: 14,
    fontWeight: '500',
  },
  registerLink: {
    marginTop: 24,
    alignSelf: 'center',
  },
  registerText: {
    color: '#2A9D8F',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default LoginScreen;