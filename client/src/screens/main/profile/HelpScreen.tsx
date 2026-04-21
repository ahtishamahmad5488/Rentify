import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Mail, Phone } from 'lucide-react-native';
export default function HelpScreen() {
  return (
    <View style={styles.container}>
      {/* Phone Card */}
      <Pressable style={styles.card}>
        <View style={styles.iconBox}>
          <Phone size={wp('6%')} color="#1C689B" />
        </View>
        <View>
          <Text style={styles.label}>Our 24×7 Customer Service</Text>
          <Text style={styles.value}>+91 6261731690</Text>
        </View>
      </Pressable>

      {/* Email Card */}
      <Pressable style={styles.card}>
        <View style={styles.iconBox}>
          <Mail size={wp('6%')} color="#1C689B" />
        </View>
        <View>
          <Text style={styles.label}>Write us at</Text>
          <Text style={styles.value}>pgfinderapp@support.com</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.3%'),
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    borderWidth: 1,
    borderColor: '#E9EEF7',
    marginBottom: hp('1.2%'),
  },
  iconBox: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('50%'),
    backgroundColor: '#D2E1EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  label: {
    color: '#6B7280',
    fontSize: wp('3.4%'),
    marginBottom: hp('0.4%'),
  },
  value: {
    color: '#1C689B',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});
