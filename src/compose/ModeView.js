import React from 'react';
import {
  View, StyleSheet
} from 'react-native';

import ComposeOptions from './ComposeOptions';
import ModeSelector from './ModeSelector';
import StreamBox from './ModeViews/StreamBox';
import PrivateBox from './ModeViews/PrivateBox';

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
      optionSelected, handleOptionSelected, narrow, users } = this.props;

    return (
      <View style={inlineStyles.wrapper}>
        <ModeSelector modeSelected={modeSelected} onModeChange={this.handleModeChanged} />
        <View style={inlineStyles.divider} />
        {modeSelected === 0 &&
          <ComposeOptions selected={optionSelected} onChange={handleOptionSelected} />
        }
        {modeSelected === 1 &&
          <StreamBox
            operator={operator}
            operand={operand}
            setOperator={setOperator}
            setOperand={setOperand}
            narrow={narrow}
          />
        }
        {modeSelected === 2 &&
          <PrivateBox operand={operand} setOperand={setOperand} narrow={narrow} users={users} />
        }
      </View>
    );
  }
}
