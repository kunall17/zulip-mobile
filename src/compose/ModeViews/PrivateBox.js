import React, { Component } from 'react';
import {
  View, StyleSheet
} from 'react-native';
import TagInput from 'react-native-tag-input';

import PeopleAutocomplete from '../../autocomplete/PeopleAutocomplete';

const styles = StyleSheet.create({
  privateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
});

export default class PrivateBox extends Component {
  constructor() {
    super();
    this.state = {
      autoComplete: false,
      email: {},
      text: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.narrow !== nextProps.narrow) {
      const recipientEmails = nextProps.narrow[0].operand.split(',');
      const email = {};
      const mapEmailToName = (element) => {
        email[element] = this.props.users.find(x => x.email === element).fullName;
      };
      recipientEmails.forEach(mapEmailToName);
      this.setState({ email }, this.updateOperand);
    }
  }

  updateOperand = () =>
    this.props.setOperand(Object.keys(this.state.email).join(','));

  handleAutocompleteOperator = (operand) => {
    const newState = { ...this.state.email };
    newState[operand.email] = operand.name;
    this.setState({ email: newState, text: '' }, this.updateOperand);
  }

  onChangeTags = (newNames) => {
    const newEmail = { ...this.state.email };
    let c = 0;
    for (const mail in newEmail) {
      if (newEmail[mail] !== newNames[c++]) {
        delete newEmail[mail];
        break;
      }
    }
    this.setState({
      email: newEmail
    }, this.updateOperand);
  };

  handleChangeText = (text: string) => {
    this.setState({ text });
  }

  extractNames = () => {
    const { email } = this.state;
    return Object.values(email);
  }

  render() {
    const { text } = this.state;
    const inputProps = {
      keyboardType: 'default',
      placeholder: 'Enter names',
      autoFocus: true,
      onChangeText: this.handleChangeText,
      value: text
    };

    return (
      <View style={styles.privateInput}>
        {text.length > 0 &&
          <PeopleAutocomplete
            filter={text}
            onAutocomplete={this.handleAutocompleteOperator}
          />}
        <TagInput
          value={this.extractNames()}
          onChange={this.onChangeTags}
          tagColor="#ecf0f1"
          tagTextColor="black"
          inputProps={inputProps}
          numberOfLines={1}
        />
      </View>
    );
  }
}
