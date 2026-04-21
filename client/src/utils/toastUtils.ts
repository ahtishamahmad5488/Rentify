import Toast from 'react-native-toast-message';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const showToast = (
  type: 'success' | 'error' | 'info',
  text1: string,
  text2: string,
) => {
  return new Promise<void>(resolve => {
    Toast.show({
      type,
      text1,
      text2,
      position: 'top',
      visibilityTime: 1000,
      autoHide: true,
      topOffset: hp('7%'),
      text1Style: {
        fontSize: 14,
        fontWeight: '700',
        color: type === 'success' ? 'green' : 'red',
      },
      text2Style: {
        fontSize: 14,
        color: '#4d4d4dff',
      },
      onHide: () => resolve(),
    });
  });
};
