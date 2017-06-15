import { NotificationsAndroid } from 'react-native-notifications';

import { homeNarrow, specialNarrow } from '../utils/narrow';
import { tryUntilSuccessful } from '../utils/async';
import { getSubscriptions, getMessages, getStreams, getUsers } from '../api';
import { messageFetchSuccess } from '../message/messagesActions';
import { initSubscriptions } from '../subscriptions/subscriptionsActions';
import { initStreams } from '../streamlist/streamsActions';
import { initUsers } from '../users/usersActions';
import {
  INITIAL_FETCH_COMPLETE,
  SAVE_TOKEN_GCM,
  DELETE_TOKEN_GCM,
} from '../actionConstants';

export const initialFetchComplete = () => ({
  type: INITIAL_FETCH_COMPLETE,
});

export const fetchEssentialInitialData = (auth) =>
  async (dispatch) => {
    const [subscriptions, messages] = await Promise.all([
      await tryUntilSuccessful(() => getSubscriptions(auth)),
      await tryUntilSuccessful(() => getMessages(auth, 0, 10, 10, homeNarrow(), true)),
    ]);

    dispatch(messageFetchSuccess(
      messages,
      homeNarrow(),
      { older: false, newer: false },
      {},
      true,
    ));
    dispatch(initSubscriptions(subscriptions));
    dispatch(initialFetchComplete());
  };

export const fetchRestOfInitialData = (auth, gcmToken) =>
  async (dispatch) => {
    const [streams, users, messages] = await Promise.all([
      await tryUntilSuccessful(() => getStreams(auth)),
      await tryUntilSuccessful(() => getUsers(auth)),
      await tryUntilSuccessful(() =>
        getMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private'))
      ),
    ]);
    dispatch(messageFetchSuccess(messages, specialNarrow('private')));
    dispatch(initStreams(streams));
    dispatch(initUsers(users));
    if (auth.apiKey !== '' && gcmToken === '') {
      NotificationsAndroid.refreshToken();
    }
  };


export const deleteTokenGCM = () => ({
  type: DELETE_TOKEN_GCM
});

export const saveTokenGCM = (gcmToken) => ({
  type: SAVE_TOKEN_GCM,
  gcmToken
});
