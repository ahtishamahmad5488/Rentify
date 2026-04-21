import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Search } from 'lucide-react-native';
import img1 from '../../assets/images/p1.png';
import { getAllUser } from '../../utils/api/apiClient';

export default function AllUserListScreen() {
  const [userList, setUserList] = useState([]);
  const getAllUserList = async () => {
    try {
      const response = await getAllUser();
      const resData = response.users;
      setUserList(resData);
    } catch (error) {
      console.log('Error fetching to get all users.');
    }
  };
  useEffect(() => {
    getAllUserList();
  }, []);

  console.log(userList);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={wp('5%')} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search something"
          placeholderTextColor="#888"
        />
      </View>
      <FlatList
        data={userList}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={img1} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.agentName}>{item.fullName}</Text>
              <Text style={styles.agentPhone}>{item.mobileNumber}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('2%'),
    paddingTop: hp('1%'),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('1.5%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: wp('2%'),
    fontSize: wp('4%'),
    color: '#000',
    padding: 0,
  },
  listContent: {
    paddingBottom: hp('2%'),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('1%'),
    paddingVertical: hp('0.4%'),
    marginBottom: hp('1%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: wp('2%'),
  },
  avatar: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('6%'),
    backgroundColor: '#ffb366',
    resizeMode: 'cover',
  },
  textContainer: {
    marginLeft: wp('1%'),
  },
  agentName: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  },
  agentPhone: {
    fontSize: wp('3.5%'),
    color: '#888',
    marginTop: hp('0.5%'),
  },
});
