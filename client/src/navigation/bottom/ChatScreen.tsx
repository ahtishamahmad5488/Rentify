import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import img1 from '../../assets/images/chats/1.png';
import img2 from '../../assets/images/chats/2.png';
import img3 from '../../assets/images/chats/3.png';
import img4 from '../../assets/images/chats/4.png';
import img5 from '../../assets/images/chats/5.png';
import img6 from '../../assets/images/chats/6.png';

export default function ChatScreen() {
  const stories = [
    { id: '1', image: img1 },
    { id: '2', image: img2 },
    { id: '3', image: img3 },
    { id: '4', image: img4 },
    { id: '5', image: img5 },
  ];

  const messages = [
    {
      id: '1',
      name: 'Ram',
      message: 'Thank you for information',
      time: '1:22 AM',
      image: img1,
    },
    {
      id: '2',
      name: 'Mohan',
      message: 'Hi there, the price is negotiable',
      time: '8:22 PM',
      image: img2,
    },
    {
      id: '3',
      name: 'Chintu',
      message: 'Have a plan for discuss this ?',
      time: '8:22 PM',
      image: img3,
    },
    {
      id: '4',
      name: 'Aditi',
      message: 'Okay let me check.',
      time: '8:22 PM',
      image: img4,
    },
    {
      id: '5',
      name: 'Rohan',
      message: 'Please send me the details.',
      time: '8:22 PM',
      image: img5,
    },
    {
      id: '6',
      name: 'Khushi',
      message: 'What is your budget?',
      time: '8:22 PM',
      image: img6,
    },
  ];

  const navigation = useNavigation();

  const renderStory = ({ item }: any) => (
    <Image source={item.image} style={styles.storyImage} />
  );

  const renderMessage = ({ item }: any) => (
    <TouchableOpacity
      style={styles.messageCard}
      onPress={() => navigation.navigate('chat-details')}
    >
      <Image source={item.image} style={styles.profileImage} />
      <View style={styles.messageInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Stories */}
      <View style={styles.storySection}>
        <TouchableOpacity style={styles.addStory}>
          <Plus color="#fff" size={wp('6%')} />
        </TouchableOpacity>

        <FlatList
          data={stories}
          horizontal
          renderItem={renderStory}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Header */}
      <Text style={styles.headerText}>All Message</Text>

      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('3%'),
    paddingTop: hp('2%'),
  },
  // 🔹 Story Section
  storySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  addStory: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: '#1C689B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  storyImage: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    marginRight: wp('3%'),
    borderWidth: 2,
    borderColor: '#1C689B',
  },

  headerText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    marginBottom: hp('0.5%'),
    color: '#000',
  },

  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    marginRight: wp('2.5%'),
  },
  messageInfo: {
    flex: 1,
  },
  name: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#000',
  },
  message: {
    fontSize: wp('3.5%'),
    color: '#9E9E9E',
    marginTop: hp('0.5%'),
  },
  time: {
    fontSize: wp('3%'),
    color: '#9E9E9E',
  },
});
