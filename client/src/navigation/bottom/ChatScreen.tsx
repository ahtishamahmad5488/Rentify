// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Plus, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';

import img1 from '../../assets/images/chats/1.png';
import img2 from '../../assets/images/chats/2.png';
import img3 from '../../assets/images/chats/3.png';
import img4 from '../../assets/images/chats/4.png';
import img5 from '../../assets/images/chats/5.png';
import img6 from '../../assets/images/chats/6.png';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';

export default function ChatScreen() {
  const navigation = useNavigation<any>();

  // Use auth store instead of getCurrentFirebaseUser() so the ID is
  // available immediately from AsyncStorage on app start.
  const user = useAuthStore(s => s.user);
  const myUid = user?._id || 'demo-tenant';

  const [realChats, setRealChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stories = [
    { id: '1', image: img1 },
    { id: '2', image: img2 },
    { id: '3', image: img3 },
    { id: '4', image: img4 },
    { id: '5', image: img5 },
  ];

  const staticMessages = [
    {
      id: 'static-1',
      type: 'static',
      name: 'Ahtisham Ahmad',
      message: 'Thank you for information',
      time: '1:22 AM',
      image: img1,
    },
    {
      id: 'static-2',
      type: 'static',
      name: 'Huzaifa Baig',
      message: 'Hi there, the price is negotiable',
      time: '8:22 PM',
      image: img2,
    },
    {
      id: 'static-3',
      type: 'static',
      name: 'Zunair Ali',
      message: 'Have a plan for discuss this?',
      time: '8:22 PM',
      image: img3,
    },
    {
      id: 'static-4',
      type: 'static',
      name: 'Sana Khan',
      message: 'Okay let me check.',
      time: '8:22 PM',
      image: img4,
    },
    {
      id: 'static-5',
      type: 'static',
      name: 'Ali Raza',
      message: 'Please send me the details.',
      time: '8:22 PM',
      image: img5,
    },
    {
      id: 'static-6',
      type: 'static',
      name: 'Maria Saleem',
      message: 'What is your budget?',
      time: '8:22 PM',
      image: img6,
    },
  ];

  useEffect(() => {
    if (!myUid || myUid === 'demo-tenant') {
      setLoading(false);
      return;
    }
    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', myUid)
      .onSnapshot(
        snap => {
          const list = snap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              type: 'real',
              peerId: data.peerId || '',
              name: data.peerName || 'Property Owner',
              message: data.lastMessage || 'No messages yet',
              time: formatTime(data.updatedAt?.toDate?.()),
              updatedAtMs: data.updatedAtMs || 0,
              propertyId: data.propertyId || null,
              image: null,
            };
          });
          // Newest first — no composite index required
          list.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
          setRealChats(list);
          setLoading(false);
        },
        err => {
          console.warn('[ChatScreen] Firestore error:', err.message);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [myUid]);

  const combinedMessages = useMemo(
    () => [...realChats, ...staticMessages],
    [realChats],
  );

  const renderStory = ({ item }: any) => (
    <Image source={item.image} style={styles.storyImage} />
  );

  const renderMessage = ({ item }: any) => {
    const isReal = item.type === 'real';
    return (
      <TouchableOpacity
        style={styles.messageCard}
        onPress={() =>
          navigation.navigate('chat-details', {
            peerId: item.peerId || 'demo-owner',
            peerName: item.name,
            propertyId: item.propertyId,
          })
        }
      >
        {item.image ? (
          <Image source={item.image} style={styles.profileImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {(item.name || 'O').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.messageInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {isReal && (
              <View style={styles.realBadge}>
                <Text style={styles.realBadgeText}>LIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
        </View>

        <Text style={styles.time}>{item.time}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Messages</Text>
        {loading && <ActivityIndicator size="small" color={PRIMARY} />}
      </View>

      <FlatList
        data={combinedMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MessageCircle size={38} color={PRIMARY} />
            <Text style={styles.emptyTitle}>No chats yet</Text>
          </View>
        }
      />
    </View>
  );
}

function formatTime(date?: Date) {
  if (!date) return 'Now';
  try {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Now';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
  },
  storySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  addStory: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: PRIMARY,
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
    borderColor: PRIMARY,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  headerText: { fontSize: wp('5%'), fontWeight: '800', color: NAVY },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('3%'),
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: hp('1.2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileImage: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    marginRight: wp('3%'),
  },
  avatarFallback: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    marginRight: wp('3%'),
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: wp('5%'), fontWeight: '800' },
  messageInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    fontSize: wp('4%'),
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
  },
  realBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  realBadgeText: { color: '#10B981', fontSize: wp('2.4%'), fontWeight: '800' },
  message: { fontSize: wp('3.4%'), color: '#6B7280', marginTop: hp('0.4%') },
  time: { fontSize: wp('3%'), color: '#9CA3AF', marginLeft: 8 },
  emptyBox: { alignItems: 'center', marginTop: hp('18%') },
  emptyTitle: {
    marginTop: 10,
    fontSize: wp('4%'),
    color: NAVY,
    fontWeight: '700',
  },
});
