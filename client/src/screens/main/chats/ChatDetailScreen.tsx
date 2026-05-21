// @ts-nocheck
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { buildChatId } from '../../../utils/firebase';
import { useAuthStore } from '../../../store/useAuthStore';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';

export default function ChatDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const listRef = useRef<FlatList>(null);

  const peerId: string = route.params?.peerId || 'demo-owner';
  const peerName: string = route.params?.peerName || 'Owner';
  const propertyId: string | null = route.params?.propertyId || null;

  // Use auth store for stable, immediately available user identity.
  // getCurrentFirebaseUser() can return null on app start before Firebase
  // auth state is restored, causing myUid to be 'demo-tenant' wrongly.
  const user = useAuthStore(s => s.user);
  const myUid = user?._id || 'demo-tenant';
  const myName = user?.name || 'Me';

  const chatId = useMemo(() => buildChatId(myUid, peerId), [myUid, peerId]);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(100)
      .onSnapshot(
        snap => {
          const list = snap.docs.map(d => {
            const data = d.data();
            return {
              _id: d.id,
              text: data.text || '',
              createdAt: data.createdAt?.toDate?.() || new Date(),
              user: data.user || { _id: 'unknown', name: 'Unknown' },
            };
          });
          setMessages(list);
          setLoading(false);
          setTimeout(
            () => listRef.current?.scrollToEnd({ animated: true }),
            80,
          );
        },
        err => {
          console.warn('[ChatDetail] Firestore snapshot error:', err.message);
          setLoading(false);
        },
      );

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = useCallback(async () => {
    const cleanText = text.trim();
    if (!cleanText || sending) return;

    // Optimistic: show message immediately before Firestore confirms
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        _id: tempId,
        text: cleanText,
        createdAt: new Date(),
        user: { _id: myUid, name: myName },
      },
    ]);
    setText('');
    setSending(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          text: cleanText,
          createdAt: firestore.FieldValue.serverTimestamp(),
          user: { _id: myUid, name: myName },
        });

      // Chat summary doc — drives the chat list screen
      await firestore()
        .collection('chats')
        .doc(chatId)
        .set(
          {
            chatId,
            participants: [myUid, peerId],
            participantNames: { [myUid]: myName, [peerId]: peerName },
            peerId,
            peerName,
            propertyId: propertyId || null,
            lastMessage: cleanText,
            updatedAt: firestore.FieldValue.serverTimestamp(),
            updatedAtMs: Date.now(),
          },
          { merge: true },
        );
    } catch (err: any) {
      console.warn('[ChatDetail] Send error:', err.message);
    } finally {
      setSending(false);
    }
  }, [text, sending, chatId, myUid, myName, peerId, peerName, propertyId]);

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.user?._id === myUid;
    return (
      <View
        style={[styles.messageRow, isMine ? styles.rowRight : styles.rowLeft]}
      >
        <View
          style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.myText : styles.otherText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[styles.timeText, isMine ? styles.myTime : styles.otherTime]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={wp('6%')} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{peerName}</Text>
          <Text style={styles.subtitle}>Property conversation</Text>
        </View>
        <View style={{ width: wp('8%') }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={PRIMARY} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Start the conversation with the property owner.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write your message..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!text.trim() || sending) && { opacity: 0.5 },
          ]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Send size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatTime(date: Date) {
  try {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FC' },
  header: {
    paddingTop: hp('5%'),
    paddingBottom: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  backBtn: {
    width: wp('8%'),
    height: wp('8%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: wp('4.6%'), fontWeight: '800', color: NAVY },
  subtitle: { fontSize: wp('3%'), color: '#6B7280', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, color: '#6B7280' },
  listContent: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    flexGrow: 1,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: hp('20%'),
  },
  emptyTitle: { fontSize: wp('4.2%'), fontWeight: '800', color: NAVY },
  emptyText: {
    fontSize: wp('3.4%'),
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  messageRow: { marginBottom: 10, flexDirection: 'row' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myBubble: { backgroundColor: PRIMARY, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  messageText: { fontSize: wp('3.8%'), lineHeight: wp('5.4%') },
  myText: { color: '#fff' },
  otherText: { color: '#111827' },
  timeText: { fontSize: wp('2.7%'), alignSelf: 'flex-end', marginTop: 4 },
  myTime: { color: 'rgba(255,255,255,0.75)' },
  otherTime: { color: '#9CA3AF' },
  inputBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: wp('4%'),
    paddingTop: 10,
    paddingBottom: hp('2.2%'),
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#111827',
    fontSize: wp('3.7%'),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
