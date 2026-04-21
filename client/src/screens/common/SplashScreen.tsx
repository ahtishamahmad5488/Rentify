import { StyleSheet, Image, View } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Logo from '../../assets/images/logo.png';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: wp('30%'),
    height: hp('20%'),
    resizeMode: 'contain',
  },
});

export default SplashScreen;
