import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import Onboarding1 from '../../assets/images/intro/1.png';
import Onboarding2 from '../../assets/images/intro/2.png';
import Onboarding3 from '../../assets/images/intro/3.png';
import Arrow from '../../assets/images/icons/arrow.png';
import { useNavigation } from '@react-navigation/native';
import OnboardingSlide from '../../components/OnboardingSlide';
const slides = [
  {
    id: '1',
    title: 'Find Your Perfect PG',
    description:
      'Easily search verified PGs with trusted reviews, clear pricing, and convenient filters.',
    image: Onboarding1,
  },
  {
    id: '2',
    title: 'Next Home Made Simple',
    description:
      'Discover nearby PGs quickly, compare amenities, check details, and move confidently.',
    image: Onboarding2,
  },
  {
    id: '3',
    title: 'PG Search Made Easy',
    description:
      'Save time finding PGs, explore options, compare features, and connect instantly.',
    image: Onboarding3,
  },
];
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);
  const navigation = useNavigation();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleClick = () => {
    navigation.navigate('signup');
  };
  return (
    <View style={[styles.container]}>
      <FlatList
        data={slides}
        renderItem={({ item }) => <OnboardingSlide item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={item => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.containerBtn}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.arrowBtnContainer} onPress={handleClick}>
        <Image source={Arrow} style={styles.image} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('8%'),
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    height: wp('2.5%'),
    width: wp('2.5%'),
    backgroundColor: '#D2E1EB',
    borderRadius: wp('1.25%'),
    marginHorizontal: wp('1%'),
  },
  activeDot: {
    backgroundColor: '#1C689B',
  },
  arrowBtnContainer: {
    position: 'absolute',
    bottom: hp('5.9%'),
    right: wp('3%'),
  },
  image: {
    width: wp('25%'),
    height: hp('5.3%'),
    resizeMode: 'contain',
  },
});
