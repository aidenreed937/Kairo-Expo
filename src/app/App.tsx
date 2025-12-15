import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { bootstrap } from './bootstrap';
import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    bootstrap()
      .then(() => setIsReady(true))
      .catch((err) => setError(err));
  }, []);

  if (error) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-red-50 p-4">
          <Text className="text-red-600 text-lg font-bold mb-2">
            Failed to initialize app
          </Text>
          <Text className="text-red-500 text-center">
            {error.message}
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="mt-4 text-gray-600">Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
