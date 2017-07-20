import React from 'react';
import { View, StyleSheet, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';

import { Screen } from '../../common';
import { renderFormatButtons } from './renderButtons';
import { getAuth } from '../../account/accountSelectors';
import AutoCompleteView from '../../autocomplete/AutoCompleteView';
import { NAVBAR_HEIGHT, BORDER_COLOR } from '../../styles';
import boundActions from '../../boundActions';

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
  },
});

class FullEditorScreen extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  constructor(props) {
    super(props);
    this.state = { text: '', selection: { start: 0, end: 0 } };
  }
  textInput: TextInput;

  changeText = (input: string) => {
    this.setState({ text: input });
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

  render() {
    const { styles } = this.context;
    const WrapperView = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const { text, selection } = this.state;
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
          <AutoCompleteView text={text} onAutocomplete={input => this.setState({ text: input })} />
          <View style={inlineStyles.buttonContainer}>
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
});

export default connect(mapStateToProps, boundActions)(FullEditorScreen);
