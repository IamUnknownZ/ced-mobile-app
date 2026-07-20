import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer screenOptions={{ headerShown: true }}>
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Arith',
            title: 'Arith',
          }}
        />
        <Drawer.Screen
          name="form"
          options={{
            drawerLabel: 'Form',
            title: 'Form',
          }}
        />
        <Drawer.Screen
          name="counter"
          options={{
            drawerLabel: 'Count',
            title: 'Count',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
