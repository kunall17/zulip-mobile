/* @flow */
import { Clipboard, Share } from 'react-native';
import type { Actions, Auth, Message, ActionSheetButtonType } from '../types';
import { getNarrowFromMessage, isHomeNarrow, isStreamNarrow, isSpecialNarrow } from '../utils/narrow';
import { getSingleMessage } from '../api';
import { isTopicMuted } from '../utils/message';
import muteTopicApi from '../api/muteTopic';
import unmuteTopicApi from '../api/unmuteTopic';
import unmuteStreamApi from '../api/unmuteStream';
import muteStreamApi from '../api/muteStream';
import deleteMessageApi from '../api/deleteMessage';
import toggleMessageStarredApi from '../api/toggleMessageStarred';
import showToast from '../utils/showToast';

type MessageAndDoNarrowType = {
  message: Object,
  actions: Actions,
  auth: Auth,
  currentRoute?: string,
};

type ReplyOptionType = {
  message: Object,
  actions: Actions,
  auth: Auth,
  currentRoute?: string,
  onReplySelect?: () => void,
};

type AuthAndMessageType = {
  auth: Auth,
  message: Object,
  getString: (value: string) => string,
};

type AuthMessageAndSubscriptionsType = {
  auth: Auth,
  message: Object,
  subscriptions: any[],
};

type ButtonProps = {
  auth?: Auth,
  message: Object,
  subscriptions: any[],
  actions: Actions,
  currentRoute?: string,
  onReplySelect?: () => void,
  getString: (value: string) => string,
};

type ExecuteActionSheetParams = {
  title: string,
  auth?: Auth,
  message: Object,
  subscriptions: any[],
  actions: Actions,
  header?: boolean,
  currentRoute?: string,
  onReplySelect?: () => void,
  getString: (value: string) => string,
};

type ConstructActionButtonsType = {
  message: Object,
  auth: Auth,
  narrow: [],
  flags: Object,
  currentRoute?: string,
  getString: (value: string) => string,
};

type ConstructHeaderActionButtonsType = {
  message: Message,
  subscriptions: any[],
  mute: any[],
  getString: (value: string) => string,
};

type MessageAuthAndActions = {
  message: Message,
  auth: Auth,
  actions: Actions,
};

type AuthMessageAndNarrow = {
  message: Message,
  auth: Auth,
  narrow: [],
};

type AuthAndMessageType = {
  message: Message,
  auth: Auth,
};

const isAnOutboxMessage = ({ message }: Message): boolean => message.isOutbox;

const narrowToConversation = ({ message, actions, auth, currentRoute }: MessageAndDoNarrowType) => {
  actions.doNarrow(getNarrowFromMessage(message, auth.email), message.id);
  if (currentRoute === 'search') {
    actions.navigateBack();
  }
};

const reply = ({ message, actions, auth, currentRoute, onReplySelect }: ReplyOptionType) => {
  actions.doNarrow(getNarrowFromMessage(message, auth.email), message.id);
  if (onReplySelect) onReplySelect(); // focus message input
  if (currentRoute === 'search') {
    actions.navigateBack();
  }
};

const copyToClipboard = async ({ getString, auth, message }: AuthGetStringAndMessageType) => {
  const rawMessage = isAnOutboxMessage({ message })
    ? message.markdownContent
    : await getSingleMessage(auth, message.id);
  Clipboard.setString(rawMessage);
  showToast(getString('Message copied!'));
};

const isSentMessage = ({ message }: Message): boolean => !isAnOutboxMessage({ message });

const editMessage = async ({ message, actions }: MessageAuthAndActions) => {
  actions.startEditMessage(message.id);
};

const deleteMessage = async ({ auth, message, actions }: MessageAuthAndActions) => {
  if (isAnOutboxMessage({ message })) {
    actions.deleteOutboxMessage(message.timestamp);
  } else {
    deleteMessageApi(auth, message.id);
  }
};

const unmuteTopic = ({ auth, message }: AuthAndMessageType) => {
  unmuteTopicApi(auth, message.display_recipient, message.subject);
};

const muteTopic = ({ auth, message }: AuthAndMessageType) => {
  muteTopicApi(auth, message.display_recipient, message.subject);
};

const unmuteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    unmuteStreamApi(auth, sub.stream_id);
  }
};

const muteStream = ({ auth, message, subscriptions }: AuthMessageAndSubscriptionsType) => {
  const sub = subscriptions.find(x => x.name === message.display_recipient);
  if (sub) {
    muteStreamApi(auth, sub.stream_id);
  }
};

const isSentBySelfAndNarrowed = ({ message, auth, narrow }: AuthMessageAndNarrow): boolean =>
  auth.email === message.sender_email && !isHomeNarrow(narrow) && !isSpecialNarrow(narrow);

const isSentBySelf = ({ message, auth }: AuthAndMessageType): boolean =>
  auth.email === message.sender_email;

const starMessage = ({ auth, message }: AuthAndMessageType) => {
  toggleMessageStarredApi(auth, [message.id], true);
};

const unstarMessage = ({ auth, message }: AuthGetStringAndMessageType) => {
  toggleMessageStarredApi(auth, [message.id], false);
};

const shareMessage = ({ message }) => {
  Share.share({
    message: message.content.replace(/<(?:.|\n)*?>/gm, ''),
  });
};

const skip = () => false;

type HeaderButtonType = {
  title: string,
  onPress: (props: ButtonProps) => void | boolean | Promise<any>,
  onlyIf?: (props: Message) => boolean,
};

const resolveMultiple = (message, auth, narrow, functions) =>
  functions.every(f => {
    if (!f({ message, auth, narrow })) return false;
    return true;
  });

const actionSheetButtons: ActionSheetButtonType[] = [
  { title: 'Reply', onPress: reply, onlyIf: isSentMessage },
  { title: 'Copy to clipboard', onPress: copyToClipboard },
  { title: 'Share', onPress: shareMessage },
  {
    title: 'Edit message',
    onPress: editMessage,
    onlyIf: ({ message, auth, narrow }) =>
      resolveMultiple(message, auth, narrow, [isSentMessage, isSentBySelfAndNarrowed]),
  },
  {
    title: 'Delete message',
    onPress: deleteMessage,
    onlyIf: ({ message, auth, narrow }) =>
      resolveMultiple(message, auth, narrow, [isSentMessage, isSentBySelf]),
  },
  // If skip then covered in constructActionButtons
  { title: 'Narrow to conversation', onPress: narrowToConversation, onlyIf: skip },
  { title: 'Star message', onPress: starMessage, onlyIf: skip },
  { title: 'Unstar message', onPress: unstarMessage, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

const actionHeaderSheetButtons: HeaderButtonType[] = [
  { title: 'Unmute topic', onPress: unmuteTopic, onlyIf: skip },
  { title: 'Mute topic', onPress: muteTopic, onlyIf: skip },
  { title: 'Mute stream', onPress: muteStream, onlyIf: skip },
  { title: 'Unmute stream', onPress: unmuteStream, onlyIf: skip },
  { title: 'Cancel', onPress: skip, onlyIf: skip },
];

export const constructHeaderActionButtons = ({
  message,
  subscriptions,
  mute,
  getString,
}: ConstructHeaderActionButtonsType) => {
  const buttons = actionHeaderSheetButtons
    .filter(x => !x.onlyIf || x.onlyIf({ message }))
    .map(x => getString(x.title));
  // These are dependent conditions, hence better if we manage here rather than using onlyIf
  if (message.type === 'stream') {
    if (isTopicMuted(message.display_recipient, message.subject, mute)) {
      buttons.push(getString('Unmute topic'));
    } else {
      buttons.push(getString('Mute topic'));
    }
    const sub = subscriptions.find(x => x.name === message.display_recipient);
    if (sub && !sub.in_home_view) {
      buttons.push(getString('Unmute stream'));
    } else {
      buttons.push(getString('Mute stream'));
    }
  }
  buttons.push(getString('Cancel'));
  return buttons;
};

export const constructActionButtons = ({
  message,
  auth,
  narrow,
  flags,
  onReplySelect,
  currentRoute,
  getString,
}: ConstructActionButtonsType) => {
  const buttons = actionSheetButtons
    .filter(x => !x.onlyIf || x.onlyIf({ message, auth, narrow }))
    .map(x => getString(x.title));
  // These are dependent conditions, hence better if we manage here rather than using onlyIf
  if (isHomeNarrow(narrow) || isStreamNarrow(narrow) || isSpecialNarrow(narrow)) {
    buttons.push('Narrow to conversation');
  }
  if (isSentMessage({ message })) {
    if (message.id in flags.starred) {
      buttons.push(getString('Unstar Message'));
    } else {
      buttons.push(getString('Star Message'));
    }
  }
  buttons.push(getString('Cancel'));
  return buttons;
};

export const executeActionSheetAction = ({
  title,
  header,
  getString,
  ...props
}: ExecuteActionSheetParams) => {
  if (header) {
    const headerButton = actionHeaderSheetButtons.find(x => getString(x.title) === title);
    if (headerButton) {
      headerButton.onPress({ ...props, getString });
    }
  } else {
    const button = actionSheetButtons.find(x => getString(x.title) === title);
    if (button) {
      button.onPress({ ...props, getString });
    }
  }
};

export type ShowActionSheetTypes = {
  options: Array<any>,
  cancelButtonIndex: number,
  callback: number => void,
};
