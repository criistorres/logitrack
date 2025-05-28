import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// import './global.css'; // ← Comentar temporariamente

export default function App() {
  return (
    <View className="flex-1 bg-red-500 justify-center items-center">
      <StatusBar style="light" />
      
      <Text className="text-white text-xl font-bold">
        🔴 Testando sem import CSS
      </Text>
      
      <Text className="text-white text-sm mt-4">
        Se funcionar, problema é no global.css
      </Text>
    </View>
  );
}