// @ts-nocheck
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface ButtonComponentProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}
export default function ButtonComponent({
  title,
  onPress,
  loading,
}: ButtonComponentProps) {
  return (
    <TouchableOpacity style={styles.submitButton} onPress={onPress}>
      {loading ? (
        <ActivityIndicator size={'small'} color={'#fff'} />
      ) : (
        <Text style={styles.submitButtonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    width: '100%',
    height: hp('6%'),
    backgroundColor: '#1C689B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});
