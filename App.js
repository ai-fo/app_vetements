import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth, LoginScreen, SignUpScreen } from './src/features/auth';
import HomeScreen from './src/screens/HomeScreen';
import { CameraScreen, AnalysisResultScreen } from './src/features/outfit-analysis';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ title: 'Analyser' }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}