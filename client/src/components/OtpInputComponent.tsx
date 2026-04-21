// @ts-nocheck
import { StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useRef } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type Props = {
  otp: string;
  setOtp: (value: string) => void;
  length?: number;
};

export default function OtpInputComponent({ otp, setOtp, length = 4 }: Props) {
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    const otpArray = otp.split('');
    otpArray[index] = text;
    const newOtp = otpArray.join('').slice(0, length);
    setOtp(newOtp);

    // Move to next box automatically
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const otpArray = Array.from({ length }, (_, i) => otp[i] || '');

  return (
    <View style={styles.inputBoxContainer}>
      {otpArray.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => (inputRefs.current[index] = ref!)}
          style={styles.inputBox}
          value={digit}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          textAlign="center"
          textContentType="oneTimeCode"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  inputBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp('7%'),
  },
  inputBox: {
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#1C689B',
    fontSize: wp('5%'),
    textAlign: 'center',
    color: '#333333',
    fontWeight: '500',
    backgroundColor: '#FBFBFB',
  },
});
