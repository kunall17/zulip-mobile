import React from 'react';
// import ComposeOptions from './ComposeOptions';
import {
  View,
} from 'react-native';
import { connect } from 'react-redux';

import { getAuth } from '../account/accountSelectors';
import styles from '../styles';
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

class ComposeBox extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = { optionSelected: 0, operator: '', operand: '' };
  }

  setOperator = (operator: string) => this.setState({ operator });
  setOperand = (operand: string) => this.setState({ operand });

  handleOptionSelected = (optionSelected: number) =>
    this.setState({ optionSelected });

  render() {
    const { optionSelected, operator, operand } = this.state;
    const { auth, narrow } = this.props;
    const ActiveComposeComponent = composeComponents[optionSelected];

    return (
      <View style={styles.composeBox}>
        <View style={styles.wrapper}>
          <ModeView
            optionSelected={optionSelected}
            handleOptionSelected={this.handleOptionSelected}
            setOperator={this.setOperator}
            setOperand={this.setOperand}
            operator={operator}
            operand={operand}
          />
        </View>
        <View style={styles.divider} />
        <ActiveComposeComponent
          auth={auth}
          narrow={narrow}
          operator={operator}
          operand={operand}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
});

export default connect(mapStateToProps)(ComposeBox);
