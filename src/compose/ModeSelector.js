import React from 'react';
import ComposeIcon from './ComposeIcon';

export default (props) => {
  switch (props.modeSelected) {
    case 0:
      return (<ComposeIcon name="ios-chatbubbles" onChange={props.onModeChange} />);
    case 1:
      return (<ComposeIcon name="ios-person" onChange={props.onModeChange} />);
    case 2:
      return (<ComposeIcon name="ios-add-circle-outline" onChange={props.onModeChange} />);
    default:
      return (<ComposeIcon name="bullhorn" onChange={props.onModeChange} />);

  }
};
