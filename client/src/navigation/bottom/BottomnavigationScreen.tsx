import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Heart,
  User,
  History,
  MessageCircleMore,
} from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Screens
import HomeScreen from './HomeScreen';
import FavoriteScreen from './FavoriteScreen';
import ChatScreen from './ChatScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';

export type BottomTabParamList = {
  Home: undefined;
  Favorite: undefined;
  Chats: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const iconMap: Record<
  keyof BottomTabParamList,
  React.ComponentType<{ color: string; size: number }>
> = {
  Home,
  Favorite: Heart,
  Chats: MessageCircleMore,
  History: History,
  Profile: User,
};

export default function BottomNavigationScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#1C689B',
        tabBarInactiveTintColor: '#595656',

        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const Icon = iconMap[route.name] || Home;
          return <Icon color={color} size={size} />;
        },
        tabBarLabelStyle: {
          fontSize: wp('3%'),
          fontWeight: '600',
          marginTop: hp('0.2%'),
        },
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: hp('8%'),
          paddingTop: hp('0.5%'),
          paddingHorizontal: wp('2%'),
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
