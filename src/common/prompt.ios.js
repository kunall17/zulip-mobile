/* @flow */
import { AlertIOS } from 'react-native';

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
  AlertIOS.prompt(
    topic,
    message,
    [
      {
        text: 'Cancel',
        onPress: onPressCancel,
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: onPressOk,
      },
    ],
    defaultValue,
  );
