// @ts-nocheck
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import { Bot, Send, MapPin, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { axiosInstance } from '../../utils/axios';
import { resolveImageUrl, formatPrice } from '../../utils/helpers';

const PRIMARY = '#0B5FFF';
const NAVY = '#061A4D';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AiProperty {
  _id: string;
  title: string;
  city: string;
  area?: string;
  price: number;
  propertyType: string;
  images: { public_id: string; secure_url: string }[];
  facilities?: string[];
  availableRooms?: number;
}

type MessageRole = 'user' | 'ai';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  properties?: AiProperty[];
  loading?: boolean;
}

// ─── Welcome message ──────────────────────────────────────────────────────────

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm Rentify AI 🏠\nTell me what you're looking for and I'll find the best properties for you.\n\nTry: \"Find a furnished room near Johar Town under 20k\"",
};

// ─── Property card inside chat ────────────────────────────────────────────────

function PropertyChatCard({
  property,
  onPress,
}: {
  property: AiProperty;
  onPress: () => void;
}) {
  const imageUrl = resolveImageUrl(property.images);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.propCard}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.propImage} />
      ) : (
        <View style={[styles.propImage, styles.propImageFallback]} />
      )}
      <View style={styles.propBadge}>
        <Text style={styles.propBadgeText}>{property.propertyType}</Text>
      </View>
      <View style={styles.propBody}>
        <Text style={styles.propTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.propLocRow}>
          <MapPin size={10} color="#9CA3AF" />
          <Text style={styles.propLoc} numberOfLines={1}>
            {' '}
            {property.area ? `${property.area}, ` : ''}
            {property.city}
          </Text>
        </View>
        <Text style={styles.propPrice}>
          {formatPrice(property.price)}
          <Text style={styles.propPer}>/mo</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatBotScreen() {
  const navigation = useNavigation<any>();
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || aiTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
    };

    const loadingMsg: ChatMessage = {
      id: `ai-loading-${Date.now()}`,
      role: 'ai',
      text: '',
      loading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setAiTyping(true);
    scrollToBottom();

    try {
      const res = await axiosInstance.post('/ai/recommend', { query: text });
      const { message, properties } = res.data;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: message || 'Here are the results I found:',
        properties: properties || [],
      };

      setMessages(prev => [...prev.filter(m => !m.loading), aiMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'ai',
        text: "Sorry, I couldn't process that right now. Please try again.",
      };
      setMessages(prev => [...prev.filter(m => !m.loading), errMsg]);
    } finally {
      setAiTyping(false);
      scrollToBottom();
    }
  }, [input, aiTyping, scrollToBottom]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    if (item.loading) {
      return (
        <View style={styles.aiRow}>
          <View style={styles.aiBotIcon}>
            <Bot size={14} color="#fff" />
          </View>
          <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
            <ActivityIndicator size="small" color={PRIMARY} />
            <Text style={styles.typingText}>Searching properties…</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={isUser ? styles.userRow : styles.aiRow}>
        {!isUser && (
          <View style={styles.aiBotIcon}>
            <Bot size={14} color="#fff" />
          </View>
        )}

        <View style={styles.msgBlock}>
          <View
            style={[
              styles.bubble,
              isUser ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isUser ? styles.userText : styles.aiText,
              ]}
            >
              {item.text}
            </Text>
          </View>

          {/* Property cards */}
          {!isUser && item.properties && item.properties.length > 0 && (
            <View style={styles.propList}>
              {item.properties.map(p => (
                <PropertyChatCard
                  key={p._id}
                  property={p}
                  onPress={() =>
                    navigation.navigate('room-details', { propertyId: p._id })
                  }
                />
              ))}
            </View>
          )}

          {!isUser && item.properties && item.properties.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                No properties found. Try a different search.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Rentify AI</Text>
          <Text style={styles.headerSub}>Property Assistant</Text>
        </View>
        {aiTyping && (
          <View style={styles.typingDot}>
            <ActivityIndicator size="small" color={PRIMARY} />
          </View>
        )}
      </View>

      {/* Chat list */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything about properties…"
          placeholderTextColor="#9CA3AF"
          multiline
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || aiTyping) && { opacity: 0.4 },
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || aiTyping}
          activeOpacity={0.8}
        >
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8FC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: hp('5%'),
    paddingBottom: hp('1.8%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: wp('4.4%'), fontWeight: '800', color: NAVY },
  headerSub: { fontSize: wp('3%'), color: '#6B7280', marginTop: 1 },
  typingDot: { marginLeft: 'auto' },

  // List
  listContent: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    gap: 16,
  },

  // Message rows
  userRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  aiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  aiBotIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  msgBlock: { flex: 1 },

  // Bubbles
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  bubbleText: { fontSize: wp('3.8%'), lineHeight: wp('5.4%') },
  userText: { color: '#fff' },
  aiText: { color: '#111827' },
  typingText: { fontSize: wp('3.4%'), color: '#6B7280' },

  // Property list inside chat
  propList: { marginTop: 8, gap: 10 },
  propCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  propImage: { width: '100%', height: hp('16%') },
  propImageFallback: { backgroundColor: '#E5E7EB' },
  propBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(11,95,255,0.88)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  propBadgeText: { color: '#fff', fontSize: wp('2.6%'), fontWeight: '700' },
  propBody: { padding: wp('3%') },
  propTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  propLocRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  propLoc: { fontSize: wp('3%'), color: '#9CA3AF', flex: 1 },
  propPrice: { fontSize: wp('4%'), fontWeight: '800', color: PRIMARY },
  propPer: { fontSize: wp('2.8%'), color: '#9CA3AF', fontWeight: '400' },

  noResults: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  noResultsText: { color: '#92400E', fontSize: wp('3.4%') },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: wp('4%'),
    paddingTop: 10,
    paddingBottom: hp('2.5%'),
    backgroundColor: '#fff',
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
    fontSize: wp('3.7%'),
    color: '#111827',
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
