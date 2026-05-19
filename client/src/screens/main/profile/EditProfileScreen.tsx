import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ArrowLeft, Camera } from 'lucide-react-native';
import ButtonComponent from '../../../components/ButtonComponent';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileScreen() {
  const [name, setName] = useState('Ahtisham Ahmad');
  const [mobile, setMobile] = useState('+92 3217734008');
  const [email, setEmail] = useState('bsf2201170@ue.edu.pk');
  const [address, setAddress] = useState('Walton Road, Lahore, Pakistan');
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container}>
      {/* Profile Image */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
          }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.cameraIcon}>
          <Camera size={wp('4.5%')} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          keyboardType="phone-pad"
          onChangeText={setMobile}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, { height: hp('10%') }]}
          value={address}
          multiline
          onChangeText={setAddress}
        />
      </View>

      <TouchableOpacity style={{ marginTop: hp('4%') }}>
        <ButtonComponent title="Submit" onPress={() => {}} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },

  profileSection: {
    alignItems: 'center',
    marginTop: hp('3%'),
    marginBottom: hp('2%'),
  },
  profileImage: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: wp('35%'),
    backgroundColor: '#1C689B',
    borderRadius: wp('4%'),
    padding: wp('1.3%'),
  },
  form: {
    width: wp('90%'),
    marginTop: hp('0.2%'),
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#111',
    marginBottom: hp('0.7%'),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('3%'),
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('3%'),
    marginBottom: hp('2%'),
    fontSize: wp('3.8%'),
    color: '#333',
  },
});
