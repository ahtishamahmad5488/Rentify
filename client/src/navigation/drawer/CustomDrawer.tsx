'use client';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { LayoutDashboard, LogOut, Users, HousePlus } from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useAuthStore } from '../../store/useAuthStore';
import { showToast } from '../../utils/toastUtils';

const CustomMenuCard = ({ icon, title, onClick, isFocused }) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.menuItem, isFocused && styles.focusedMenuItem]}
    >
      {React.cloneElement(icon, {
        color: isFocused ? 'white' : 'black',
        size: wp('5.6%'),
      })}
      <Text
        style={[styles.menuItemText, isFocused && styles.focusedMenuItemText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const CustomDrawer = ({ navigation }) => {
  const [activeScreen, setActiveScreen] = useState('bottom-navigation');
  const user = useAuthStore.getState().user;

  const handleNavigation = screenName => {
    setActiveScreen(screenName);
    navigation.navigate(screenName);
  };

  const logout = useAuthStore.getState().logout;
  const handleLogout = async () => {
    await logout();
    showToast('success', 'Success', 'Logout successful.');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Drawer Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.textContainer}>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <Text style={styles.userRole}>+91 {user?.mobileNumber}</Text>
            </View>
          </View>
        </View>

        {/* Drawer Content */}
        <ScrollView style={styles.menuList}>
          <CustomMenuCard
            icon={<LayoutDashboard />}
            title="Dashboard"
            onClick={() => handleNavigation('bottom-navigation')}
            isFocused={activeScreen === 'bottom-navigation'}
          />

          <CustomMenuCard
            icon={<HousePlus />}
            title="Create PG/Rooms"
            onClick={() => handleNavigation('create-pg')}
            isFocused={activeScreen === 'create-pg'}
          />
          <CustomMenuCard
            icon={<Users />}
            title="User List"
            onClick={() => handleNavigation('all-user-list')}
            isFocused={activeScreen === 'all-user-list'}
          />
        </ScrollView>

        {/* Drawer Footer */}
        <View style={styles.footer}>
          <CustomMenuCard
            icon={<LogOut />}
            title="Logout"
            onClick={() => handleLogout()}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: wp('70%'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp('10%'),
    paddingHorizontal: wp('5%'),
    marginTop: hp('2%'),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: wp('2%'),
  },
  userName: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    marginBottom: hp('0.5%'),
  },
  userRole: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: wp('4%'),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 8,
    marginVertical: hp('0.4%'),
  },
  focusedMenuItem: {
    backgroundColor: '#1C689B',
  },
  menuItemText: {
    marginLeft: wp('5%'),
    fontSize: wp('4.2%'),
    fontWeight: '500',
    color: 'black',
  },
  focusedMenuItemText: {
    color: 'white',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
  },
});

export default CustomDrawer;
