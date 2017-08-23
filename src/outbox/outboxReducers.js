/* @flow */
import type { OutboxState, Action } from '../types';
import {
  MESSAGE_SEND,
  EVENT_NEW_MESSAGE,
  LOGOUT,
  DELETE_OUTBOX_MESSAGE,
  MESSAGE_SEND_SUCCESS,
} from '../actionConstants';

const initialState = [];

const reducer = (state: OutboxState = initialState, action: Action): OutboxState => {
  switch (action.type) {
    case MESSAGE_SEND: {
      const message = state.find(item => item.timestamp === action.params.timestamp);
      if (message) return state;
      return [...state, { ...action.params }];
    }
    case MESSAGE_SEND_SUCCESS:
    case DELETE_OUTBOX_MESSAGE:
    case EVENT_NEW_MESSAGE: {
      const newState = state.filter(item => item.timestamp !== +action.localMessageId);
      return newState.length === state.length ? state : newState;
    }
    case LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};

export default reducer;
