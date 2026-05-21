import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const tagFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(tagFade, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoBox,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        {/* Logo mark */}
        <View style={styles.mark}>
          <View style={styles.markInner}>
            <Text style={styles.markText}>R</Text>
          </View>
        </View>
        <Text style={styles.appName}>Rentify</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, {opacity: tagFade}]}>
        Find your perfect place
      </Animated.Text>

      {/* Dot indicator */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[styles.dot, i === 1 && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    alignItems: 'center',
  },
  mark: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('5%'),
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: hp('2%'),
  },
  markInner: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('3%'),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markText: {
    fontSize: wp('8%'),
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  appName: {
    fontSize: wp('9%'),
    fontWeight: '900',
    color: NAVY,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: wp('3.8%'),
    color: '#6B7280',
    marginTop: hp('1.5%'),
    letterSpacing: 0.3,
  },
  dots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: hp('8%'),
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: PRIMARY,
    width: 18,
  },
});

export default SplashScreen;
