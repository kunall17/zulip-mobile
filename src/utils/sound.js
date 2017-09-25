/* @flow */
import Sound from 'react-native-sound';
import { logErrorRemotely } from '../utils/logging';

const messageSound = new Sound('zulip.mp3', Sound.MAIN_BUNDLE, error => {
  if (error) {
    logErrorRemotely(error, 'Failed to load the sound');
  }
});

export const playMessageSound = () => messageSound.play();
