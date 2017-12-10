/* @flow */
import prompt from 'react-native-prompt-android';

export default ({
  topic,
  message,
  defaultValue,
  onPressOk,
  onPressCancel,
  placeholder,
}: {
  topic: string,
  message: string,
  defaultValue: string,
  onPressOk: string => string,
  onPressCancel: () => void,
  placeholder: string,
}) =>
  prompt(
    topic,
    message,
    [
      { text: 'Cancel', onPress: onPressCancel, style: 'cancel' },
      { text: 'OK', onPress: onPressOk },
    ],
    {
      cancelable: true,
      defaultValue,
      placeholder,
    },
  );
