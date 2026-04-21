// @ts-nocheck
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import img1 from '../assets/images/slider/1.png';
import img2 from '../assets/images/slider/2.png';
import img3 from '../assets/images/slider/3.png';
import img4 from '../assets/images/slider/4.png';
const images = [img1, img2, img3, img4];

export default function Slider() {
  return (
    <View style={styles.container}>
      <SwiperFlatList
        autoplay
        autoplayDelay={3}
        autoplayLoop
        showPagination
        paginationStyle={styles.paginationContainer}
        paginationStyleItemActive={styles.activeDot}
        paginationStyleItemInactive={styles.inactiveDot}
        data={images}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item} style={styles.image} />
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: wp('100%'),
          offset: wp('100%') * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: wp('100%'),
    alignSelf: 'center',
  },
  slide: {
    width: wp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: wp('95%'),
    height: hp('25%'),
    borderRadius: wp('4%'),
  },
  paginationContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp('25%'),
  },
  activeDot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#1C689B',
    marginHorizontal: wp('1%'),
  },
  inactiveDot: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#BFDBFE',
    marginHorizontal: wp('1%'),
  },
});
