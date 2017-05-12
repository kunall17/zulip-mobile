import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import styles from '../styles';
import { Input } from '../common';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { registerUserInputActivity } from '../utils/activity';
import sendMessage from '../api/sendMessage';
import SendButton from './SendButton';
import getAutocompletedText from '../autocomplete/getAutocompletedText';
import EmojiAutocomplete from '../autocomplete/EmojiAutocomplete';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import PeopleAutocomplete from '../autocomplete/PeopleAutocomplete';

const MIN_HEIGHT = 38;
const MAX_HEIGHT = 200;

const componentStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  messageBox: {
    flex: 1,
  },
});

type Props = {
  auth: Object,
  narrow: Object,
};

export default class ComposeText extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      editing: false,
      text: '',
      autocomplete: false,
      contentHeight: MIN_HEIGHT,
    };
  }

  handleSend = () => {
    const { auth, operator, operand } = this.props;
    const { text } = this.state;
    if (operator === 'pm-with') {
      sendMessage(auth, 'private', operand, '', text);
    } else if (operand === '') {
      sendMessage(auth, 'stream', operator, '(no topic)', text);
    } else {
      sendMessage(auth, 'stream', operator, operand, text);
    }
    this.clearInput();
  }

  clearInput = () => {
    this.textInput.clear();
    this.setState({
      text: ''
    });
  }

  handleContentSizeChange = (event) =>
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });

  handleChangeText = (text: string) => {
    const { auth } = this.props;
    registerUserInputActivity(auth);
    this.setState({ text });
  }

  handleAutocomplete = (autocomplete) => {
    if (typeof autocomplete === 'object') {
      autocomplete = autocomplete.name;
    }
    const text = getAutocompletedText(this.state.text, autocomplete);
    this.textInput.setNativeProps({ text });
    this.setState({ text });
  }

  render() {
    const { contentHeight, text } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);
    const lastword = text.match(/\b(\w+)$/);
    const lastWordPrefix = lastword && lastword.index && text[lastword.index - 1];
    return (
      <View style={componentStyles.wrapper}>
        {lastWordPrefix === ':' &&
          <EmojiAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '#' &&
          <StreamAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '@' &&
          <PeopleAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        <ScrollView style={{ height }} contentContainerStyle={componentStyles.messageBox}>
          <Input
            style={styles.composeText}
            ref={component => { this.textInput = component; }}
            multiline
            underlineColorAndroid="transparent"
            height={contentHeight}
            onContentSizeChange={this.handleContentSizeChange}
            onChangeText={this.handleChangeText}
            placeholder="Type a message here"
          />
        </ScrollView>
        <SendButton
          disabled={text.length === 0}
          onPress={this.handleSend}
        />
      </View>
    );
  }
}
