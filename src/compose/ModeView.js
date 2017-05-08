import React from 'react';
import {
  View, TextInput, Text, StyleSheet
} from 'react-native';

import ComposeOptions from './ComposeOptions';
import ModeSelector from './ModeSelector';

const inlineStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  streamInputWrapper: {
    flexDirection: 'row', alignItems: 'center', flex: 1
  },
  privateInput: {
    flex: 1
  },
  divider: {
    width: 2,
    backgroundColor: '#ecf0f1',
    margin: 4
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

export default class ModeView extends React.Component {
  render() {
    const { modeSelected, optionSelected, handleOptionSelected, handleModeChanged } = this.props;

    return (
      <View style={inlineStyles.wrapper}>
        <ModeSelector modeSelected={modeSelected} onModeChange={handleModeChanged} />
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
