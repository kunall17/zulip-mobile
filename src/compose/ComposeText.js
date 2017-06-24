/* @flow */
import React from 'react';
import { StyleSheet, View, ScrollView, TextInput } from 'react-native';
import { NotificationsAndroid } from 'react-native-notifications';

import styles from '../styles';
import { MatchResult, Auth, Narrow, User } from '../types';
import { Input } from '../common';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { registerUserInputActivity } from '../utils/activity';
import sendMessage from '../api/sendMessage';
import SendButton from './SendButton';
import getAutocompletedText from '../autocomplete/getAutocompletedText';
import EmojiAutocomplete from '../autocomplete/EmojiAutocomplete';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import PeopleAutocomplete from '../autocomplete/PeopleAutocomplete';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';

const MIN_HEIGHT = 38;
const MAX_HEIGHT = 200;

const componentStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  messageBox: {
    flex: 1,
  },
});

type Props = {
  auth: Auth,
  narrow: Narrow,
  operator: string,
  users: User[],
};

export default class ComposeText extends React.Component {

  props: Props;
  textInput: TextInput;

  state: {
    editing: boolean,
    text: string,
    autocomplete: boolean,
    contentHeight: number,
  }

  state = {
    editing: false,
    text: '',
    autocomplete: false,
    contentHeight: MIN_HEIGHT,
  };
  rnd = () => Math.floor(Math.random() * 100) + 1;
  handleSend = () => {
    NotificationsAndroid.localNotification({
      'sender_full_name': `Watson ${this.rnd()}`,
      'google.sent_time': 1497506244014,
      'sender_avatar_url': 'https://secure.gravatar.com/avatar/7b82892ab28701cc6bfe7798b3498eb7?d=identicon&version=1',
      'content_truncated': 'false',
      'zulip_message_id': '227901',
      'recipient_type': 'private',
      'time': '1497506243',
      'user': 'kunall.gupta17@gmail.com',
      'alert': 'New private message from Watson',
      'event': 'message',
      'google.message_id': '0:1497506244033759%46869b2df9fd7ecd',
      'content': `Hello${this.rnd()} ${this.rnd()} ${this.rnd()} `,
      'sender_email': `watson43517${this.rnd()}@gmail.com`
    }, 1);
    //
    // NotificationsAndroid.localNotification({
    //   'sender_full_name': 'Watson',
    //   'google.sent_time': 1497506282911,
    //   'sender_avatar_url': '/user_avatars/2/b72674b783578f8c21b96b330823b5f819082fa3.png?x=x&version=2',
    //   'content_truncated': 'false',
    //   'zulip_message_id': '227902',
    //   'recipient_type': 'private',
    //   'time': '1497506282',
    //   'user': 'kunall.gupta17@gmail.com',
    //   'alert': 'New private message from Watson',
    //   'event': 'message',
    //   'google.message_id': '0:1497506282918178%46869b2df9fd7ecd',
    //   'content': 'ONe more',
    //   'sender_email': 'watson43517@gmail.com'
    // });
    //
    // NotificationsAndroid.localNotification({
    //   'sender_full_name': 'Watson',
    //   ' google.sent_time': 1497508104254,
    //   'sender_avatar_url': '/user_avatars/2/b72674b783578f8c21b96b330823b5f819082fa3.png?x=x&version=2',
    //   'content_truncated': 'false',
    //   'zulip_message_id': '227954',
    //   'recipient_type': 'private',
    //   'time': '1497508103',
    //   'user': 'kunall.gupta17@gmail.com',
    //   'alert': 'New private group message from Watson',
    //   'event': 'message',
    //   'google.message_id': '0:1497508104262464%46869b2df9fd7ecd',
    //   'content': 'group push test,ignore karde bhai :P',
    //   'sender_email': 'watson43517@gmail.com'
    // });
    // const { auth, narrow, operator } = this.props;
    // const { text } = this.state;
    //
    // if (isPrivateOrGroupNarrow(narrow)) {
    //   sendMessage(auth, 'private', narrow[0].operand, '', text);
    // } else if (isTopicNarrow(narrow) || isStreamNarrow(narrow)) {
    //   if (operator !== null) {
    //     sendMessage(auth, 'stream', narrow[0].operand,
    //     (operator === '') ? '(no topic)' : operator, text);
    //   } else if (isTopicNarrow(narrow)) {
    //     sendMessage(auth, 'stream', narrow[0].operand, narrow[1].operand, text);
    //   } else if (isStreamNarrow(narrow)) {
    //     sendMessage(auth, 'stream', narrow[0].operand, '(no topic)', text);
    //   }
    // }
    //
    //
    // this.clearInput();
  }

  clearInput = () => {
    this.textInput.clear();
    this.setState({
      text: '',
      contentHeight: MIN_HEIGHT,
    });
  }

  handleOnChange = (event: Object) =>
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });

  handleChangeText = (text: string) => {
    const { auth } = this.props;
    registerUserInputActivity(auth);
    this.setState({ text });
  }

  handleAutocomplete = (autocomplete: string) => {
    const text = getAutocompletedText(this.state.text, autocomplete);
    this.textInput.setNativeProps({ text });
    this.setState({ text });
  }

  render() {
    const { narrow, auth, users } = this.props;
    const { contentHeight, text } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);
    const lastword: MatchResult = text.match(/\b(\w+)$/);
    const lastWordPrefix = lastword && lastword.index && text[lastword.index - 1];

    return (
      <View>
        {lastWordPrefix === ':' && lastword &&
          <EmojiAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '#' && lastword &&
          <StreamAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '@' && lastword &&
          <PeopleAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        <View style={componentStyles.wrapper}>
          <ScrollView style={{ height }} contentContainerStyle={componentStyles.messageBox}>
            <Input
              style={styles.composeText}
              textInputRef={component => { this.textInput = component; }}
              multiline
              underlineColorAndroid="transparent"
              height={contentHeight}
              onChange={this.handleOnChange}
              onChangeText={this.handleChangeText}
              placeholder={getComposeInputPlaceholder(narrow, auth.email, users)}
            />
          </ScrollView>
          <SendButton
            disabled={text.length === 0}
            onPress={this.handleSend}
          />
        </View>
      </View>
    );
  }
}
