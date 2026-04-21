import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const languages = ['English', 'Hindi', 'Gujarati', 'Marathi'];
export default function LanguageScreen() {
  const [selected, setSelected] = useState('English');

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = selected === item;
    return (
      <TouchableOpacity
        style={[styles.languageBox, isSelected && styles.selectedBox]}
        onPress={() => setSelected(item)}
        activeOpacity={0.7}
      >
        <View style={styles.radioOuter}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.languageText}>{item}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your preferred language is?</Text>
      <FlatList
        data={languages}
        renderItem={renderItem}
        keyExtractor={item => item}
        numColumns={2}
        contentContainerStyle={{ paddingVertical: hp('2%') }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: hp('1.5%'),
        }}
      />
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
  title: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
  },
  languageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    width: wp('44.3%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: wp('1%'),
  },
  selectedBox: {
    borderWidth: 1,
    borderColor: '#1C689B',
  },
  radioOuter: {
    width: wp('4.5%'),
    height: wp('4.5%'),
    borderRadius: wp('2.25%'),
    borderWidth: 1.5,
    borderColor: '#1C689B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  radioInner: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#1C689B',
  },
  languageText: {
    fontSize: wp('4%'),
    color: '#111',
    fontWeight: '500',
  },
});
