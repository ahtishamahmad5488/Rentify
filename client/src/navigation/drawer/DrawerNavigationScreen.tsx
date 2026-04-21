import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from './CustomDrawer';
import BottomNavigationScreen from '../bottom/BottomnavigationScreen';
import CreatePgScreen from './CreatePgScreen';
import AllUserListScreen from './AllUserListScreen';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import CustomHeader from './CustomHeader';

const Drawer = createDrawerNavigator();
export default function DrawerNavigationScreen() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        drawerStyle: {
          width: wp('70%'),
        },
        header: ({ route }) => <CustomHeader title={route.name} />,
      }}
    >
      <Drawer.Screen
        name="bottom-navigation"
        component={BottomNavigationScreen}
      />
      <Drawer.Screen name="create-pg" component={CreatePgScreen} />
      <Drawer.Screen name="all-user-list" component={AllUserListScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({});
