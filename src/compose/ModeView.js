import React from 'react';
import {
  View, StyleSheet
} from 'react-native';

import ComposeOptions from './ComposeOptions';
import ModeSelector from './ModeSelector';

const inlineStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  divider: {
    width: 2,
    backgroundColor: '#ecf0f1',
    margin: 4
  },
});

export default class ModeView extends React.Component {
  constructor() {
    super();
    this.state = {
      modeSelected: 0,
    };
  }

  handleModeChanged = () => {
    const { setOperand, setOperator } = this.props;

    this.setState({
      modeSelected: (this.state.modeSelected === 2) ? 0 : this.state.modeSelected + 1,
      operator: (this.state.modeSelected === 1) ? 'pm-with' : '',
      operand: ''
    });
    if (this.state.modeSelected === 1) {
      setOperator('pm-with');
    } else {
      setOperator('');
    }
    setOperand('');
  };

  render() {
    const { modeSelected } = this.state;
    const { setOperator, setOperand, operator, operand,
      optionSelected, handleOptionSelected } = this.props;

    return (
      <View style={inlineStyles.wrapper}>
        <ModeSelector modeSelected={modeSelected} onModeChange={this.handleModeChanged} />
        <View style={inlineStyles.divider} />
        {modeSelected === 0 &&
          <ComposeOptions selected={optionSelected} onChange={handleOptionSelected} />
        }
        {modeSelected === 1 &&
          <View style={inlineStyles.streamInputWrapper}>
            <TextInput style={inlineStyles.streamInput} placeholder={'Stream'} />
            <Text>{'>'}</Text>
            <TextInput style={inlineStyles.topicInput} placeholder={'Topic'} />
          </View>
        }
        {modeSelected === 2 &&
          <TextInput style={inlineStyles.privateInput} placeholder={'Enter Names'} />
        }
      </View>
    );
  }
}
