import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

const USERS_STORAGE_KEY = '@users_data';

interface UserData {
  username: string;
  password: string;
  avatar: string | null;
  appTitle: string;
  noteTitle: string;
}

const AccountListScreen = ({ navigation }: any) => {
  const { login } = useUser();
  const [users, setUsers] = useState<UserData[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加载所有用户
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
        if (stored) {
          setUsers(JSON.parse(stored));
        }
      } catch (error) {
        console.error('加载用户失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  // 验证生物识别
  const handleVerifyBiometric = async () => {
    try {
      // 检查设备是否支持生物识别
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('提示', '设备不支持生物识别，请使用设备密码验证');
        return;
      }

      // 检查是否已录入生物信息
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('提示', '请先在手机设置中录入指纹或面部信息');
        return;
      }

      // 弹出生物识别验证
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '验证身份以查看账号密码',
        fallbackLabel: '使用设备密码',
        disableDeviceFallback: false, // 允许使用设备密码作为备选
      });

      if (result.success) {
        setIsVerified(true);
        // 30 秒后自动隐藏密码
        setTimeout(() => {
          setIsVerified(false);
          setShowPasswords({});
        }, 30000);
      } else {
        Alert.alert('验证失败', '无法验证身份，请重试');
      }
    } catch (error) {
      Alert.alert('错误', '生物识别验证出错');
    }
  };

  // 切换显示/隐藏密码
  const togglePassword = (username: string) => {
    if (!isVerified) {
      handleVerifyBiometric();
      return;
    }
    setShowPasswords(prev => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  // 自动登录
  const handleAutoLogin = async (username: string, password: string) => {
    const success = await login(username, password);
    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('登录失败', '账号或密码错误');
    }
  };

  const renderUser = ({ item }: { item: UserData }) => {
    const isPasswordVisible = showPasswords[item.username] && isVerified;

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item.username}</Text>
            <View style={styles.passwordRow}>
              <Text style={styles.passwordLabel}>密码：</Text>
              {isPasswordVisible ? (
                <Text style={styles.passwordText}>{item.password}</Text>
              ) : (
                <TouchableOpacity onPress={() => togglePassword(item.username)}>
                  <View style={styles.verifyBadge}>
                    <Ionicons name="finger-print" size={16} color="#fff" />
                    <Text style={styles.verifyText}>
                      {isVerified ? '点击查看' : '验证查看'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.appTitle}>{item.appTitle}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => handleAutoLogin(item.username, item.password)}
        >
          <Text style={styles.loginBtnText}>登录</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>所有账号</Text>
        <View style={{ width: 28 }} />
      </View>

      {!isVerified && (
        <TouchableOpacity style={styles.verifyBanner} onPress={handleVerifyBiometric}>
          <Ionicons name="finger-print" size={24} color="#fff" />
          <Text style={styles.verifyBannerText}>点击验证身份以查看密码</Text>
        </TouchableOpacity>
      )}

      {isVerified && (
        <View style={styles.verifiedBar}>
          <Ionicons name="checkmark-circle" size={20} color="#2A9D8F" />
          <Text style={styles.verifiedText}>已通过验证（30秒后自动锁定）</Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={item => item.username}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>暂无账号</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F6FA',
    paddingTop: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A9D8F',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  verifyBannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    gap: 6,
  },
  verifiedText: {
    color: '#2A9D8F',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A9D8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  passwordLabel: {
    fontSize: 14,
    color: '#888',
  },
  passwordText: {
    fontSize: 14,
    color: '#E76F51',
    fontWeight: '600',
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A9D8F',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  verifyText: {
    color: '#fff',
    fontSize: 12,
  },
  appTitle: {
    fontSize: 13,
    color: '#999',
  },
  loginBtn: {
    backgroundColor: '#2A9D8F',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 40,
  },
});

export default AccountListScreen;