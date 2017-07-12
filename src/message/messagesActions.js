/* @flow */
import type { Action, Narrow, Dispatch, GetState, Fetching } from '../types';
import { getMessages } from '../api';
import { registerAppActivity } from '../utils/activity';
import { getAuth } from '../account/accountSelectors';
import { getAnchor } from '../chat/chatSelectors';
import config from '../config';
import {
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  MARK_MESSAGES_READ,
} from '../actionConstants';

export const switchNarrow = (narrow: Narrow): Action => ({
  type: SWITCH_NARROW,
  narrow,
});

export const doNarrow = (newNarrow: Narrow, anchor: number = Number.MAX_SAFE_INTEGER): Action => (
  dispatch: Dispatch,
  getState: GetState
) => {
  registerAppActivity(getAuth(getState()));
  requestIdleCallback(() => dispatch(switchNarrow(newNarrow)));
};

export const messageFetchStart = (narrow: Narrow, fetching: Object): Action => ({
  type: MESSAGE_FETCH_START,
  narrow,
  fetching,
});

export const messageFetchSuccess = (
  messages: any[],
  narrow: Narrow,
  fetching?: Fetching,
  caughtUp?: Object
): Action => ({
  type: MESSAGE_FETCH_SUCCESS,
  messages,
  narrow,
  fetching,
  caughtUp,
});

export const backgroundFetchMessages = (
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Narrow,
  useFirstUnread: boolean = false
): Action => async (dispatch: Dispatch, getState: GetState) => {
  const messages = await getMessages(
    getAuth(getState()),
    anchor,
    numBefore,
    numAfter,
    narrow,
    useFirstUnread
  );

  let caughtUp = { older: false, newer: false };
  if (!useFirstUnread) {
    // Find the anchor in the results (or set it past the end of the list)
    // We can use the position of the anchor to determine if we're caught up
    // in both directions.
    let anchorIdx = messages.findIndex(msg => msg.id === anchor);
    if (anchorIdx < 0) anchorIdx = messages.length;

    // If we're requesting messages before the anchor as well, then the server
    // returns one less than we expect (so as not to duplicate the anchor)
    const adjustment = numBefore > 0 ? -1 : 0;
    caughtUp = {
      ...(numBefore ? { older: anchorIdx + 1 < numBefore } : {}),
      ...(numAfter ? { newer: messages.length - anchorIdx + adjustment < numAfter } : {}),
    };
  }

  dispatch(
    messageFetchSuccess(
      messages,
      narrow,
      {
        ...(numBefore ? { older: false } : {}),
        ...(numAfter ? { newer: false } : {}),
      },
      caughtUp
    )
  );
};

export const fetchMessages = (
  anchor: number,
  numBefore: number,
  numAfter: number,
  narrow: Narrow,
  useFirstUnread: boolean = false
): Action => async (dispatch: Dispatch) => {
  if (numBefore < 0 || numAfter < 0) {
    throw Error('numBefore and numAfter must >= 0');
  }

  dispatch(
    messageFetchStart(narrow, {
      ...(numBefore ? { older: true } : {}),
      ...(numAfter ? { newer: true } : {}),
    })
  );
  dispatch(backgroundFetchMessages(anchor, numBefore, numAfter, narrow, useFirstUnread));
};

export const fetchMessagesAtFirstUnread = (narrow: Narrow): Action => (dispatch: Dispatch) =>
  fetchMessages(0, config.messagesPerRequest / 2, config.messagesPerRequest / 2, narrow, true);

export const markMessagesRead = (messageIds: number[]): Action => ({
  type: MARK_MESSAGES_READ,
  messageIds,
});

export const fetchOlder = () => (dispatch: Dispatch, getState: GetState): Action => {
  const state = getState();
  const anchor = getAnchor(state);
  const { fetching, caughtUp, narrow } = state.chat;

  if (!fetching.older && !caughtUp.older && anchor) {
    dispatch(fetchMessages(anchor.older, config.messagesPerRequest, 0, narrow));
  }
};

export const fetchNewer = () => (dispatch: Dispatch, getState: GetState): Action => {
  const state = getState();
  const anchor = getAnchor(state);
  const { fetching, caughtUp, narrow } = state.chat;

  if (!fetching.newer && !caughtUp.newer && anchor) {
    dispatch(fetchMessages(anchor.newer, 0, config.messagesPerRequest, narrow));
  }
};
