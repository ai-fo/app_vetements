import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth, LoginScreen, SignUpScreen } from './src/features/auth';
import HomeScreen from './src/screens/HomeScreen';
import RecommendationDetailScreen from './src/screens/RecommendationDetailScreen';
import { 
  CameraScreen, 
  AnalysisResultScreen, 
  AddItemTypeSelector,
  ClothingItemForm 
} from './src/features/outfit-analysis';
import { WardrobeScreen, ItemEditor } from './src/features/virtual-wardrobe';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="AddOutfit" 
        component={AddItemTypeSelector}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="CameraScreen" 
        component={CameraScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
      <Stack.Screen 
        name="RecommendationDetail" 
        component={RecommendationDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="ClothingItemForm" 
        component={ClothingItemForm}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="WardrobeScreen" 
        component={WardrobeScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="ItemEditor" 
        component={ItemEditor}
        options={{
          presentation: 'modal',
        }}
      />
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

  return user ? <MainStack /> : <AuthStack />;
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