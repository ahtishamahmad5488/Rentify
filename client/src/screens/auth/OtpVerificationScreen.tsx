// @ts-nocheck
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import ButtonComponent from '../../components/ButtonComponent';
import { useNavigation, useRoute } from '@react-navigation/native';
import OtpInputComponent from '../../components/OtpInputComponent';
import { resendOtp, verifyOtp } from '../../utils/api/authApi';
import { showToast } from '../../utils/toastUtils';
import { useAuthStore } from '../../store/useAuthStore';

const otpSchema = z.object({
  otp: z
    .string()
    .min(4, 'OTP must be 4 digits')
    .max(4, 'OTP must be 4 digits')
    .regex(/^\d+$/, 'Only digits are allowed'),
});
type OtpFormData = z.infer<typeof otpSchema>;
export default function OtpVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileNumber } = route.params as { mobileNumber: string };
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const handleVerifyOtp = async (data: OtpFormData) => {
    setLoading(true);
    try {
      const response = await verifyOtp('+91' + mobileNumber, data.otp);
      await showToast(
        'success',
        'Verified',
        response.message || 'OTP verified successfully!',
      );
      setUser(response.user, response.token);
      navigation.navigate('welcome');
    } catch (error: any) {
      showToast(
        'error',
        'Error',
        error.message || 'Otp verification failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (mobileNumber: string) => {
    try {
      const response = await resendOtp('+91' + mobileNumber);
      await showToast(
        'success',
        'Success',
        response.message || 'Resend otp successful.',
      );
    } catch (error: any) {
      showToast('error', 'Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstSection}>
        {/* Header Section */}
        <Text style={styles.headerText}>OTP Verification</Text>
        <View style={styles.headerUnderline} />
        <Text style={styles.subtitleText}>
          Please enter the verification code we have just sent on{' '}
          <Text style={styles.mobileNumberText}>{mobileNumber}</Text>
        </Text>
        <Controller
          control={control}
          name="otp"
          render={({ field: { onChange, value } }) => (
            <OtpInputComponent otp={value} setOtp={onChange} length={4} />
          )}
        />

        {/* Show validation error */}
        {errors.otp && (
          <Text style={styles.errorText}>{errors.otp.message}</Text>
        )}

        <View style={styles.resendPrompt}>
          <Text style={styles.resendPromptText}>Didn’t received the code?</Text>
          <TouchableOpacity onPress={() => handleResendOtp(mobileNumber)}>
            <Text style={styles.resendLinkText}>Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.secondSection}>
        <ButtonComponent
          title="Verify"
          onPress={handleSubmit(handleVerifyOtp)}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    backgroundColor: 'white',
  },
  firstSection: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondSection: {
    flex: 0.52,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: hp('12%'),
  },
  headerText: {
    fontSize: wp('7%'),
    fontWeight: '500',
    color: '#333333',
  },
  headerUnderline: {
    height: hp('0.4%'),
    width: wp('18%'),
    backgroundColor: '#366AA3',
    marginTop: hp('1%'),
    marginBottom: hp('1.5%'),
    alignSelf: 'center',
  },
  subtitleText: {
    fontSize: wp('4%'),
    color: 'black',
    marginBottom: hp('4%'),
    marginTop: hp('1%'),
    textAlign: 'center',
  },
  resendPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('3%'),
  },
  resendPromptText: {
    fontSize: wp('3.8%'),
    color: '#9E9E9E',
    marginRight: wp('1%'),
    fontWeight: '400',
  },
  resendLinkText: {
    fontSize: wp('3.7%'),
    color: '#366AA3',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: hp('2%'),
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  mobileNumberText: {
    color: '#366AA3',
    fontWeight: '600',
  },
});
