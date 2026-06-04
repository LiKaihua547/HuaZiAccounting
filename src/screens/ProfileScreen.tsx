import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Image, Alert, ScrollView, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTransactions } from '../context/TransactionContext';
import { useUser } from '../context/UserContext';

const ProfileScreen = () => {
  const { transactions } = useTransactions();
  const {
    user,
    logout,
    updateAvatar,
    changePassword,
    nickname,
    updateNickname,
    appTitle,
    noteTitle,
  } = useUser();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newNickname, setNewNickname] = useState(nickname);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要权限', '请在设置中允许访问相册');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('错误', '无法打开相册');
    }
  };

  const handleLogout = () => {
    Alert.alert('退出', '确定要退出登录吗？', [
      { text: '取消' },
      { text: '确定', onPress: () => logout() },
    ]);
  };

  const handleChangePassword = () => {
    if (!oldPwd.trim() || !newPwd.trim()) {
      Alert.alert('提示', '请输入旧密码和新密码');
      return;
    }
    const success = changePassword(oldPwd, newPwd);
    if (success) {
      Alert.alert('成功', '密码已修改');
      setPasswordModalVisible(false);
      setOldPwd('');
      setNewPwd('');
    } else {
      Alert.alert('失败', '旧密码不正确');
    }
  };

  const handleUpdateNickname = () => {
    const trimmed = newNickname.trim();
    if (!trimmed) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }
    updateNickname(trimmed);
    setNicknameModalVisible(false);
    Alert.alert('成功', `昵称已更新为 "${trimmed}"`);
  };

  const avatarSource = user?.avatar ? { uri: user.avatar } : undefined;
  const userInitials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';
  const getColorFromName = (name: string) => {
    const colors = ['#F4A261', '#2A9D8F', '#E76F51', '#E9C46A', '#264653', '#6A4C93'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickAvatar}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: getColorFromName(user?.username || 'U') }]}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>我的资产</Text>
          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.label}>总收入</Text>
              <Text style={[styles.value, { color: '#2A9D8F' }]}>¥{totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>总支出</Text>
              <Text style={[styles.value, { color: '#E76F51' }]}>¥{totalExpense.toFixed(2)}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>结余</Text>
              <Text style={[styles.value, { color: balance >= 0 ? '#2A9D8F' : '#E76F51' }]}>
                ¥{balance.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsGroup}>
          {/* 修改昵称 (替代原来的两个修改标题) */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setNewNickname(nickname);
              setNicknameModalVisible(true);
            }}
          >
            <Ionicons name="person-outline" size={22} color="#666" />
            <Text style={styles.settingText}>修改昵称</Text>
            <View style={styles.settingRight}>
              <Text style={styles.nicknameHint}>{nickname}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => setPasswordModalVisible(true)}>
            <Ionicons name="lock-closed-outline" size={22} color="#666" />
            <Text style={styles.settingText}>修改密码</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('关于', `${appTitle} v2.0`)}>
            <Ionicons name="information-circle-outline" size={22} color="#666" />
            <Text style={styles.settingText}>关于我们</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <Ionicons name="exit-outline" size={22} color="#E76F51" />
            <Text style={[styles.settingText, { color: '#E76F51' }]}>退出登录</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 修改密码模态框 */}
      <Modal
        animationType="slide"
        transparent
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改密码</Text>
            <TextInput
              style={styles.input}
              placeholder="旧密码"
              placeholderTextColor="#999"
              secureTextEntry
              value={oldPwd}
              onChangeText={setOldPwd}
            />
            <TextInput
              style={styles.input}
              placeholder="新密码"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleChangePassword}>
                <Text style={styles.confirmText}>确认修改</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 修改昵称模态框 */}
      <Modal
        animationType="slide"
        transparent
        visible={nicknameModalVisible}
        onRequestClose={() => setNicknameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>修改昵称</Text>
            <Text style={styles.modalHint}>修改后，记账本和记事本标题将自动更新为：{newNickname || nickname}记账本 / 记事本</Text>
            <TextInput
              style={styles.input}
              placeholder="输入新昵称"
              placeholderTextColor="#999"
              value={newNickname}
              onChangeText={setNewNickname}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setNicknameModalVisible(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleUpdateNickname}>
                <Text style={styles.confirmText}>确认修改</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F6FA', paddingTop: 30 },
  content: { paddingBottom: 40 },
  avatarWrap: { alignSelf: 'center', marginTop: 20, marginBottom: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#e0e0e0', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#fff' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2A9D8F', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  card: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 16, color: '#888', marginBottom: 18, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { alignItems: 'center', flex: 1 },
  label: { fontSize: 13, color: '#aaa', marginBottom: 8 },
  value: { fontSize: 20, fontWeight: '700' },
  settingsGroup: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 20, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
  settingText: { fontSize: 16, color: '#333', marginLeft: 14, flex: 1, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  nicknameHint: { color: '#999', marginRight: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', borderRadius: 24, padding: 28, alignItems: 'stretch' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginBottom: 12, textAlign: 'center' },
  modalHint: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: '#F3F4F8', borderRadius: 14, paddingHorizontal: 16, height: 48, fontSize: 16, marginBottom: 16, color: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F0F0F0', marginRight: 12 },
  confirmBtn: { backgroundColor: '#2A9D8F' },
  cancelText: { color: '#666', fontWeight: '600', fontSize: 16 },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default ProfileScreen;