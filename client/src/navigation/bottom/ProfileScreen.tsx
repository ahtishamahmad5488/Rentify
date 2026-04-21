import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  Lock,
  Globe,
  Moon,
  HelpCircle,
  MessageCircle,
  Info,
  UserX,
  Pencil,
} from 'lucide-react-native';
import ButtonComponent from '../../components/ButtonComponent';
import { useNavigation } from '@react-navigation/native';
import { showToast } from '../../utils/toastUtils';
import { useAuthStore } from '../../store/useAuthStore';
import img1 from '../../assets/images/p1.png';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const user = useAuthStore.getState().user;
  const logout = useAuthStore.getState().logout;
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      showToast('success', 'Success', 'Logout successful.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: hp('3%') }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>

        <View style={styles.profileContainer}>
          <Image source={img1} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName}</Text>
            <Text style={styles.profileEmail}>+91 {user?.mobileNumber}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('edit-profile')}>
            <Pencil size={wp('5%')} color="#414141" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
      {/* Access Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Access</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('change-password')}
        >
          <Lock size={wp(5)} color="#393A3F" />
          <Text style={styles.menuText}>Change Password</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('language')}
        >
          <Globe size={wp(5)} color="#393A3F" />
          <Text style={styles.menuText}>Change Preferred Language</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Moon size={wp(5)} color="#393A3F" />
          <Text style={styles.menuText}>Dark Mode</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      {/* Help & Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <View style={{ gap: hp('0.8%') }}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('help')}
          >
            <HelpCircle size={wp(5)} color="#393A3F" />
            <Text style={styles.menuText}>Help Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('send-feedback')}
          >
            <MessageCircle size={wp(5)} color="#393A3F" />
            <Text style={styles.menuText}>Send Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('about-us')}
          >
            <Info size={wp(5)} color="#393A3F" />
            <Text style={styles.menuText}>About Us</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.divider} />
      {/* Other Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other</Text>
        <TouchableOpacity style={styles.deleteButton}>
          <UserX size={wp(5)} color="#E63A3A" />
          <Text style={styles.deleteText}>Delete My Account</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={{ marginTop: hp('3%') }}>
        <ButtonComponent
          title="Logout"
          onPress={() => {
            handleLogout();
          }}
          loading={loading}
        />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1%'),
  },
  header: {
    marginBottom: hp('1.6%'),
  },
  headerTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1%'),
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
  },
  profileImage: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('7.5%'),
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
  },
  profileEmail: {
    fontSize: wp('3.6%'),
    color: '#71717A',
    marginTop: hp('0.5%'),
  },
  section: {
    paddingVertical: hp('1%'),
  },

  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: hp('1%'),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
  },
  menuText: {
    fontSize: wp('4%'),
    color: '#393A3F',
    marginLeft: wp('3%'),
    flex: 1,
    fontWeight: '500',
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: wp('4%'),
    color: '#E63A3A',
    marginLeft: wp('3%'),
    flex: 1,
    fontWeight: '500',
  },
  divider: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#D1D5DB',
    marginTop: hp('0.5%'),
    marginBottom: hp('0.5%'),
  },
});
