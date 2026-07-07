import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1,}}>
      <Drawer screenOptions={{
        headerStyle:{
          backgroundColor: '#47F',
        },
        headerTintColor: 'white',
        drawerStyle: {
          backgroundColor: '#444',
          width: 200,
        },
        drawerActiveTintColor: '#FFF',
        drawerInactiveTintColor: '#ABB',
      }} >
      <Drawer.Screen name="index" options={{
        title: "Home Screen",
        drawerLabel: "Home ",
        drawerIcon: ({color}) => (
          <FontAwesome name="home" size={24} color={color} />
        ),
      }}/>
      <Drawer.Screen name="education" options={{
        title: "My Education",
        drawerLabel: "Education",
        drawerIcon: ({color}) => (
          <FontAwesome name="book" size={24} color={color} />
        ),
      }} />
      <Drawer.Screen name="contact" options={{
        title: "My Contact",
        drawerLabel: "Contact",
        drawerIcon: ({color}) => (
          <FontAwesome name='laptop' size={24} color={color} />
        ),
      }}/>
    </Drawer>
  </GestureHandlerRootView>
);
}
