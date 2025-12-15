import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from './routes';
import { CounterScreen } from '@features/counter/presentation/screens/CounterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName={AppRoutes.Counter}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0ea5e9',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name={AppRoutes.Counter}
        component={CounterScreen}
        options={{ title: 'Counter' }}
      />
    </Stack.Navigator>
  );
};
