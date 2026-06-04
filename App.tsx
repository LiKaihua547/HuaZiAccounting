import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { UserProvider, useUser } from './src/context/UserContext';
import { TransactionProvider, useTransactions } from './src/context/TransactionContext';
import { NoteProvider } from './src/context/NoteContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AccountListScreen from './src/screens/AccountListScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import EditTransactionScreen from './src/screens/EditTransactionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import NoteListScreen from './src/screens/NoteListScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 记账 Stack
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
    </Stack.Navigator>
  );
}

// 记事本 Stack
function NoteStack() {
  return (
    <NoteProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="NoteList" component={NoteListScreen} />
        <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
      </Stack.Navigator>
    </NoteProvider>
  );
}

// 自定义底部栏（进入记事本时隐藏）
function CustomTabBar({ state, descriptors, navigation }: any) {
  const currentRoute = state.routes[state.index];
  if (currentRoute.name === 'NoteTab' || currentRoute.name === 'AIChatTab') {
    return null; // 隐藏底部栏
  }

  const icons: Record<string, { focused: string; unfocused: string }> = {
    HomeTab: { focused: 'home', unfocused: 'home-outline' },
    NoteTab: { focused: 'document-text', unfocused: 'document-text-outline' },
    AIChatTab: { focused: 'sparkles', unfocused: 'sparkles-outline' },
    ProfileTab: { focused: 'person', unfocused: 'person-outline' },
  };

  const handlePress = (routeName: string, isFocused: boolean) => {
    if (!isFocused) {
      navigation.navigate(routeName);
    }
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const iconConfig = icons[route.name] || icons.HomeTab;
          const iconName = isFocused ? iconConfig.focused : iconConfig.unfocused;
          const color = isFocused ? '#2A9D8F' : '#B0B0B0';

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={styles.tabButton}
              onPress={() => handlePress(route.name, isFocused)}
            >
              <Ionicons name={iconName} size={26} color={color} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// 主界面（登录后可见）
function MainTabs() {
  const { user, nickname } = useUser();
  const { transactions, addTransaction } = useTransactions();


  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="NoteTab" component={NoteStack} />
      <Tab.Screen name="AIChatTab" component={AIChatScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// 登录注册栈
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AccountList" component={AccountListScreen} />
    </Stack.Navigator>
  );
}

// 根导航器
function RootNavigator() {
  const { isLoggedIn, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F6FA' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2A9D8F' }}>华子记账本</Text>
        <Text style={{ marginTop: 10, color: '#999' }}>加载中...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <TransactionProvider>
          <MainTabs />
        </TransactionProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

// 应用入口
export default function App() {
  return (
    <UserProvider>
      <RootNavigator />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});