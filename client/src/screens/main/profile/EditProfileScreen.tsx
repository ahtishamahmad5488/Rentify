import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useAuthStore } from '../../../store/useAuthStore';
import { axiosInstance } from '../../../utils/axios';
import { showToast } from '../../../utils/toastUtils';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [imageAsset, setImageAsset] = useState<Asset | null>(null);
  // Preview: show newly picked local URI, else existing Cloudinary URL, else null
  const [previewUri, setPreviewUri] = useState<string | null>(
    user?.profileImage?.secure_url || null,
  );
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (res.didCancel || res.errorCode) return;
    const asset = res.assets?.[0];
    if (asset?.uri) {
      setImageAsset(asset);
      setPreviewUri(asset.uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (phone.trim()) formData.append('phone', phone.trim());
      if (imageAsset?.uri) {
        formData.append('profileImage', {
          uri: imageAsset.uri,
          name: imageAsset.fileName || 'avatar.jpg',
          type: imageAsset.type || 'image/jpeg',
        } as any);
      }

      const res = await axiosInstance.patch('/auth/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data?.user;
      if (updated) {
        updateUser({
          name: updated.name,
          phone: updated.phone ?? null,
          profileImage: updated.profileImage?.secure_url
            ? {
                public_id: updated.profileImage.public_id,
                secure_url: updated.profileImage.secure_url,
              }
            : user?.profileImage ?? null,
        });
      }

      showToast('success', 'Profile updated', 'Your changes have been saved.');
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update profile.';
      showToast('error', 'Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = (name || user?.name || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: hp('6%') }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.avatarWrap}
          activeOpacity={0.85}
        >
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <Camera size={wp('4.5%')} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to change photo</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor="#bbb"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+92 300 1234567"
          placeholderTextColor="#bbb"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={user?.email || ''}
          editable={false}
          placeholderTextColor="#bbb"
        />
        <Text style={styles.hint}>Email cannot be changed from the app.</Text>
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('1.5%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  backBtn: {
    width: wp('8%'),
    height: wp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: wp('4.5%'),
    fontWeight: '800',
    color: NAVY,
  },
  avatarSection: { alignItems: 'center', paddingVertical: hp('3%') },
  avatarWrap: { position: 'relative' },
  avatarImage: {
    width: wp('24%'),
    height: wp('24%'),
    borderRadius: wp('12%'),
    borderWidth: 3,
    borderColor: PRIMARY,
  },
  avatarFallback: {
    width: wp('24%'),
    height: wp('24%'),
    borderRadius: wp('12%'),
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: PRIMARY,
  },
  avatarInitial: { color: '#fff', fontSize: wp('9%'), fontWeight: '800' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1C689B',
    borderRadius: wp('4%'),
    padding: wp('2%'),
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarHint: { marginTop: 10, fontSize: wp('3.2%'), color: '#9CA3AF' },
  form: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    borderRadius: 16,
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: wp('3.5%'),
    fontWeight: '700',
    color: '#374151',
    marginBottom: hp('0.6%'),
    marginTop: hp('1.2%'),
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: hp('1.4%'),
    paddingHorizontal: wp('3.5%'),
    marginBottom: hp('0.5%'),
    fontSize: wp('3.8%'),
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  disabledInput: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  hint: { fontSize: wp('3%'), color: '#9CA3AF', marginBottom: hp('1%') },
  saveBtn: {
    marginHorizontal: wp('4%'),
    marginTop: hp('3%'),
    backgroundColor: PRIMARY,
    paddingVertical: hp('1.8%'),
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: wp('4.2%') },
});
