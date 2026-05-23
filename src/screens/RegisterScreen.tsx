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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }: any) => {
  const { register } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('提示', '请输入账号和密码');
      return;
    }
    const success = register(username.trim(), password);
    if (!success) {
      Alert.alert('注册失败', '用户名已存在');
    } else {
      Alert.alert('注册成功', '自动登录', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <LinearGradient colors={['#E8F5E9', '#E3F2FD', '#F1F8E9']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.titleWrap}>
            <Ionicons name="person-add" size={52} color="#2A9D8F" />
            <Text style={styles.title}>创建账户</Text>
            <Text style={styles.subtitle}>开始记账之旅</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="用户名"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="密码"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <LinearGradient
                colors={['#2A9D8F', '#45B7A5']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>注 册</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>已有账号？去登录</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingTop: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A2E',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C6B7A',
    marginTop: 6,
  },
  card: {
    width: width - 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 18,
    paddingHorizontal: 20,
    height: 56,
    fontSize: 16,
    marginBottom: 18,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
  },
  buttonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  link: {
    textAlign: 'center',
    color: '#2A9D8F',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default RegisterScreen;