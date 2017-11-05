/* TODO: flow */
import NotificationsIOS from 'react-native-notifications';

import type { Auth } from '../types';
import registerPush from '../api/registerPush';
import { logErrorRemotely } from './logging';
import { streamNarrow, privateNarrow } from '../utils/narrow';

const register = async (auth: Auth, deviceToken: string) => {
  await registerPush(auth, deviceToken);
};

const onPushRegistered = (auth: Auth, deviceToken: string, saveTokenPush: (arg: string) => any) => {
  register(auth, deviceToken);
  saveTokenPush(deviceToken);
};

const onPushRegistrationFailed = (error: string) => {
  logErrorRemotely(new Error(error), 'register ios push token failed');
};

export const initializeNotifications = (auth: Auth, saveTokenPush: (arg: string) => any) => {
  NotificationsIOS.addEventListener('remoteNotificationsRegistered', deviceToken =>
    onPushRegistered(auth, deviceToken, saveTokenPush),
  );
  NotificationsIOS.addEventListener(
    'remoteNotificationsRegistrationFailed',
    onPushRegistrationFailed.bind(null, auth),
  );
  NotificationsIOS.requestPermissions();
};

export const refreshNotificationToken = () => {};

export const handlePendingNotifications = async (notification, doNarrow) => {
  if (notification) {
    const data = notification.getData();
    if (data && data.custom) {
      const { custom: { zulip } } = data;
      if (zulip && zulip.recipient_type) {
        if (zulip.recipient_type === 'stream') {
          doNarrow(streamNarrow(zulip.stream, zulip.topic));
        } else if (zulip.recipient_type === 'private') {
          doNarrow(privateNarrow(zulip.sender_email));
        }
      }
    }
  }
};
