// @ts-nocheck
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import { buildChatId, getCurrentFirebaseUser } from '../../../utils/firebase';

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const peerId: string = route.params?.peerId || 'demo-owner';
  const peerName: string = route.params?.peerName || 'Owner';

  const me = getCurrentFirebaseUser();
  const myUid = me?.uid || 'demo-tenant';
  const myName = me?.displayName || 'Me';

  const chatId = useMemo(() => buildChatId(myUid, peerId), [myUid, peerId]);
  const [messages, setMessages] = useState<IMessage[]>([]);

  // ─── Firestore subscription: real-time message stream ─────────────────────
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snap) => {
        if (!snap) return;
        const list: IMessage[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            _id: d.id,
            text: data.text,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            user: data.user,
          };
        });
        setMessages(list);
      });
    return () => unsubscribe();
  }, [chatId]);

  // ─── Send: write a single message into Firestore ───────────────────────────
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const m = newMessages[0];
      if (!m) return;

      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          text: m.text,
          createdAt: firestore.FieldValue.serverTimestamp(),
          user: { _id: myUid, name: myName },
        });

      // Maintain conversation summary doc — useful for chat list later.
      await firestore().collection('chats').doc(chatId).set(
        {
          participants: [myUid, peerId],
          lastMessage: m.text,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    },
    [chatId, myUid, myName, peerId],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={wp('6%')} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{peerName}</Text>
        <View style={{ width: wp('6%') }} />
      </View>

      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{ _id: myUid, name: myName }}
        placeholder="Write your message..."
        showUserAvatar={false}
        renderAvatar={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: hp('4%') },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: hp('1.2%'),
    paddingTop: hp('2%'),
  },
  title: { fontSize: wp('4.4%'), fontWeight: '700', color: '#000' },
});
