import React from 'react';
import { View } from 'react-native';

import styles from '../styles';
// import ComposeOptions from './ComposeOptions';
import ComposeText from './ComposeText';
import CameraRollView from './CameraRollView';
import ModeView from './ModeView';


type Props = {
  onSend: (content: string) => undefined,
};

const composeComponents = [
  ComposeText,
  CameraRollView,
  View,
  View,
  View,
];

export default class ComposeBox extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      optionSelected: 0,
      modeSelected: 0
    };
  }

  handleOptionSelected = (optionSelected: number) =>
    this.setState({ optionSelected });

  handleModeChanged = () =>
    this.setState({
      modeSelected: (this.state.modeSelected === 2) ? 0 : this.state.modeSelected + 1
    });

  render() {
    const { optionSelected, modeSelected } = this.state;
    const ActiveComposeComponent = composeComponents[optionSelected];

    return (
      <View style={styles.composeBox}>
        <View style={styles.wrapper}>
          <ModeView
            modeSelected={modeSelected}
            handleModeChanged={this.handleModeChanged}
            optionSelected={optionSelected}
            handleOptionSelected={this.handleOptionSelected}
          />
        </View>
        <View style={styles.divider} />
        <ActiveComposeComponent />
      </View>
    );
  }
}
