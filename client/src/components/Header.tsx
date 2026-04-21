import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
      >
        <ArrowLeft size={wp('6%')} color="#000" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      <View style={{ width: wp('6%') }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('7%'),
    paddingBottom: hp('1.2%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
});
