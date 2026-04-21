import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import ButtonComponent from '../../../components/ButtonComponent';
import { useNavigation } from '@react-navigation/native';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="******"
              secureTextEntry={!showPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <Eye size={wp('5%')} color="#666" />
              ) : (
                <EyeOff size={wp('5%')} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Re-enter New Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="******"
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <Eye size={wp('5%')} color="#666" />
              ) : (
                <EyeOff size={wp('5%')} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Password rules */}
        <View style={styles.passwordRules}>
          <Text style={styles.ruleText}>Must be at least 5 characters</Text>
          <Text style={styles.ruleText}>
            Must contain a unique character like !@?
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <ButtonComponent title="Submit" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },

  formContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#111',
    marginBottom: hp('0.8%'),
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: wp('2.5%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    fontSize: wp('3.8%'),
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: wp('3%'),
    top: hp('1.6%'),
  },
  passwordRules: {
    marginTop: hp('1%'),
  },
  ruleText: {
    color: 'green',
    fontSize: wp('3.5%'),
    marginBottom: hp('0.5%'),
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    marginBottom: hp('3%'),
  },
});
