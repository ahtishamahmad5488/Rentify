import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  ChevronRight,
  LogOut,
  Pencil,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { showToast } from '../../utils/toastUtils';
import { useAuthStore } from '../../store/useAuthStore';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';
const BG = '#F6F8FC';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const handleLogout = async () => {
    setLoading(true);
    try {
      logout();
      showToast('success', 'Logged out', 'See you next time!');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: hp('5%') }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBox}>
            {user?.profileImage?.secure_url ? (
              <Image
                source={{ uri: user.profileImage.secure_url }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.editIconBtn}
            onPress={() => navigation.navigate('edit-profile')}
            activeOpacity={0.8}
          >
            <Pencil size={14} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.profileEmail}>{user?.email || '—'}</Text>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Access */}
      <SectionCard title="Account">
        <MenuItem
          icon={<Lock size={18} color={PRIMARY} />}
          label="Change Password"
          onPress={() => navigation.navigate('change-password')}
        />
      </SectionCard>

      {/* Preferences */}
      <SectionCard title="Preferences">
        <MenuItem
          icon={<Globe size={18} color="#8B5CF6" />}
          label="Language"
          onPress={() => navigation.navigate('language')}
        />
        <MenuItem
          icon={<Moon size={18} color="#6B7280" />}
          label="Dark Mode"
          onPress={() =>
            showToast('info', 'Coming soon', 'Dark mode is under development.')
          }
        />
      </SectionCard>

      {/* Help */}
      <SectionCard title="Help & Support">
        <MenuItem
          icon={<HelpCircle size={18} color="#F59E0B" />}
          label="Help Center"
          onPress={() => navigation.navigate('help')}
        />
        <MenuItem
          icon={<MessageCircle size={18} color="#10B981" />}
          label="Send Feedback"
          onPress={() => navigation.navigate('send-feedback')}
        />
        <MenuItem
          icon={<Info size={18} color="#6B7280" />}
          label="About Rentify"
          onPress={() => navigation.navigate('about-us')}
          noBorder
        />
      </SectionCard>

      {/* Danger */}
      <SectionCard title="Other">
        <MenuItem
          icon={<UserX size={18} color="#EF4444" />}
          label="Delete My Account"
          labelColor="#EF4444"
          onPress={() =>
            showToast(
              'info',
              'Contact support',
              'To delete your account, please contact support.',
            )
          }
          noBorder
        />
      </SectionCard>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, loading && { opacity: 0.6 }]}
        onPress={handleLogout}
        disabled={loading}
        activeOpacity={0.85}
      >
        <LogOut size={18} color="#EF4444" />
        <Text style={styles.logoutText}>
          {loading ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.card}>{children}</View>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  noBorder,
  labelColor,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  noBorder?: boolean;
  labelColor?: string;
}) {
  return (
    <TouchableOpacity
      style={[sectionStyles.item, !noBorder && sectionStyles.itemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={sectionStyles.itemIcon}>{icon}</View>
      <Text
        style={[
          sectionStyles.itemLabel,
          labelColor ? { color: labelColor } : {},
        ]}
      >
        {label}
      </Text>
      <ChevronRight size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
    paddingBottom: hp('2.5%'),
    marginBottom: hp('1%'),
  },
  avatarBox: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: wp('6%'),
    fontWeight: '800',
  },
  avatarWrapper: {
    position: 'relative',
  },

  editIconBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    elevation: 5,
  },
  avatarImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('7.5%'),
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: wp('4.5%'),
    fontWeight: '800',
    color: NAVY,
  },
  profileEmail: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 5,
    backgroundColor: PRIMARY + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: { fontSize: wp('2.8%'), color: PRIMARY, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: wp('5%'),
    marginTop: hp('1%'),
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    height: hp('6.5%'),
    backgroundColor: '#FFF1F2',
  },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: wp('4%') },
});

const sectionStyles = StyleSheet.create({
  container: { marginHorizontal: wp('4%'), marginBottom: hp('1.5%') },
  title: {
    fontSize: wp('3.3%'),
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.8%'),
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#111827',
  },
});
