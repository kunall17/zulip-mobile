import React, { Component } from 'react';
import {
  View, TextInput, Text, StyleSheet
} from 'react-native';
import StreamAutocomplete from '../../autocomplete/StreamAutocomplete';

const styles = StyleSheet.create({
  streamInputWrapper: {
    flexDirection: 'row', alignItems: 'center', flex: 1
  },
  streamInput: {
    flex: 0.2,
    margin: 2
  },
  topicInput: {
    flex: 0.8,
    margin: 2
  }
});

export default class StreamBox extends Component {
  constructor() {
    super();
    this.state = { autoComplete: false };
    this.count = 0;
  }
  handleAutocompleteOperator = (operator: string) => {
    this.props.setOperator(operator);
    this.setState({ autoComplete: false });
    this.operandInput.focus();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.narrow !== nextProps.narrow) {
      if (nextProps.narrow[0].operator !== 'pm-with') {
        const { setOperand, setOperator } = this.props;
        setOperand(nextProps.narrow[0].operand);
        setOperator(nextProps.narrow[0].operator);
      }
    }
  }

  render() {
    const { operator, setOperator, operand, setOperand } = this.props;
    const { autoComplete } = this.state;
    return (
      <View style={styles.streamInputWrapper}>
        {autoComplete &&
          <StreamAutocomplete filter={operator} onAutocomplete={this.handleAutocompleteOperator} />}
        <TextInput
          style={styles.streamInput}
          placeholder={'Stream'}
          onChange={(event) => {
            this.setState({ autoComplete: true });
            setOperator(event.nativeEvent.text);
          }}
          onEndEditing={() => {
            this.setState({ autoComplete: false });
            this.operandInput.focus();
          }}
          value={operator}
          autoFocus
        />
        <Text>{'>'}</Text>
        <TextInput
          ref={component => { this.operandInput = component; }}
          style={styles.topicInput}
          placeholder={'Topic'}
          onChange={(event) => setOperand(
            event.nativeEvent.text
          )}
          value={operand}
        />
      </View>
    );
  }
}
