import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import feedbackImg from '../../../assets/images/feedback.png';
import ButtonComponent from '../../../components/ButtonComponent';
export default function SendFeedbackScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationSection}>
        <Image source={feedbackImg} style={styles.illustrationImage} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.commentsLabel}>Leave your comments (optional)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter your message"
          placeholderTextColor="#888"
          multiline={true}
          textAlignVertical="top"
        />
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

  illustrationSection: {
    width: wp('100%'),
    height: hp('30%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: wp('80%'),
    height: hp('30%'),
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('2%'),
    paddingTop: hp('2%'),
  },
  commentsLabel: {
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: hp('1%'),
    fontWeight: '500',
  },
  inputBox: {
    height: hp('15%'),
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    padding: wp('3%'),
    fontSize: wp('4%'),
    borderWidth: 1,
    borderColor: '#D3D3D3',
    marginBottom: hp('2%'),
  },
});
