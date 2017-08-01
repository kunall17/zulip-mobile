import React from 'react';
import { View, StyleSheet, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import parseMarkdown from 'zulip-markdown-parser';

import { IconMaterial } from '../../common/Icons';
import { Screen } from '../../common';
import { renderFormatButtons } from './renderButtons';
import { getAuth } from '../../account/accountSelectors';
import AutoCompleteView from '../../autocomplete/AutoCompleteView';
import { NAVBAR_HEIGHT, BORDER_COLOR } from '../../styles';
import boundActions from '../../boundActions';
import htmlToDomTree from '../../html/htmlToDomTree';
import renderHtmlChildren from '../../html/renderHtmlChildren';

const inlineStyles = StyleSheet.create({
  composeText: {
    borderColor: BORDER_COLOR,
    borderWidth: 1,
    flexDirection: 'column',
    flex: 0.9,
    padding: 4,
    paddingLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flex: 0,
    flexDirection: 'row',
  },
  inlinePadding: {
    padding: 8,
  },
  preview: {
    padding: 5,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
});

class FullEditorScreen extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  constructor(props) {
    super(props);
    this.state = { text: '', selection: { start: 0, end: 0 }, showPreview: false };
  }
  textInput: TextInput;

  changeText = (input: string) => {
    if (input === '') {
      this.setState({ showPreview: false, text: input });
    } else {
      this.setState({ text: input });
    }
  };

  onSelectionChange = event => {
    this.setState({
      selection: event.nativeEvent.selection,
    });
  };

  componentDidMount() {
    this.textInput.focus();
  }

  getState = () => {
    this.setState({
      selection: {
        start: 1,
        end: 1,
      },
    });
    return this.state;
  };

  submitText = () => {
    this.props.navigation.state.params.saveNewText(this.state.text);
    this.props.actions.navigateBack();
  };

  convertMarkdown = () => {
    this.setState({ showPreview: !this.state.showPreview });
  };

  renderPreview = () => {
    const { users, streams, auth, realm_emoji, realm_filter } = this.props;
    const html = parseMarkdown(this.state.text, users, streams, auth, realm_filter, realm_emoji);
    const childrenNodes = htmlToDomTree(html);
    return (
      <View style={inlineStyles.preview}>
        {renderHtmlChildren({
          childrenNodes,
          auth,
          actions: {},
          message: {},
        })}
      </View>
    );
  };
  render() {
    const { styles } = this.context;
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const { text, selection, showPreview } = this.state;
    return (
      <Screen
        title="Full screen editor"
        rightItem={{
          name: 'md-send',
          onPress: this.submitText,
        }}>
        <WrapperView
          behavior="padding"
          style={styles.screen}
          keyboardVerticalOffset={NAVBAR_HEIGHT}>
          <TextInput
            style={inlineStyles.composeText}
            multiline
            underlineColorAndroid="transparent"
            onChangeText={this.changeText}
            onSelectionChange={this.onSelectionChange}
            value={text}
            placeholder={'Write a long message'}
            ref={textInput => (this.textInput = textInput)}
            selection={selection}
          />
          {showPreview ? this.renderPreview() : null}
          <AutoCompleteView text={text} onAutocomplete={input => this.setState({ text: input })} />
          <View style={inlineStyles.buttonContainer}>
            <IconMaterial
              name={'visibility'}
              onPress={this.convertMarkdown}
              size={28}
              style={inlineStyles.inlinePadding}
              color={BORDER_COLOR}
            />
            {renderFormatButtons({
              getState: this.getState,
              setState: (state, callback) => {
                this.textInput.focus();
                this.setState(state, callback);
              },
            })}
          </View>
        </WrapperView>
      </Screen>
    );
  }
}

const mapStateToProps = state => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
  users: state.users,
  subscriptions: state.subscriptions,
  realm_emoji: state.realm.emoji,
  realm_filter: state.realm.realm_filter,
});

export default connect(mapStateToProps, boundActions)(FullEditorScreen);
