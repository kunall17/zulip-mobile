import React from 'react';
import { FlatList, Button } from 'react-native';

import { IconMaterialCommunity } from '../../common/Icons';
import { BORDER_COLOR } from '../../styles';

const replaceBetween = (text, selection, what) =>
  text.substring(0, selection.start) + what + text.substring(selection.end);

const applyWrapFormatNewLines = ({ getState, item, setState }) => {
  const { text, selection } = getState();
  const newText = replaceBetween(
    text,
    selection,
    `\n${item.wrapper.concat(
      '\n',
      text.substring(selection.start, selection.end),
      '\n',
      item.wrapper,
      '\n'
    )}`
  );
  let newPosition;
  if (selection.start === selection.end) {
    newPosition = selection.end + item.wrapper.length;
  } else {
    newPosition = selection.end + item.wrapper.length * 2 + 4;
  }
  const extra = {
    selection: {
      start: newPosition,
      end: newPosition
    }
  };
  setState({ text: newText }, () => {
    setTimeout(() => {
      setState({ ...extra });
    }, 25);
  });
};

const applyWrapFormat = ({ getState, item, setState }) => {
  const { text, selection } = getState();
  const newText = replaceBetween(
    text,
    selection,
    item.wrapper.concat(text.substring(selection.start, selection.end), item.wrapper)
  );
  let newPosition;
  if (selection.start === selection.end) {
    newPosition = selection.end + item.wrapper.length;
  } else {
    newPosition = selection.end + item.wrapper.length * 2;
  }
  const extra = {
    selection: {
      start: newPosition,
      end: newPosition
    }
  };
  setState({ text: newText }, () => {
    setTimeout(() => {
      setState({ ...extra });
    }, 25);
  });
};

const isStringWebLink = (text: string): boolean => {
  /* eslint-disable */
  const pattern = new RegExp(
    '^(?:(?:https?|ftp)://)(?:S+(?::S*)?@)?(?:(?!(?:10|127)(?:.d{1,3}){3})(?!(?:169.254|192.168)(?:.d{1,3}){2})(?!172.(?:1[6-9]|2d|3[0-1])(?:.d{1,3}){2})(?:[1-9]d?|1dd|2[01]d|22[0-3])(?:.(?:1?d{1,2}|2[0-4]d|25[0-5])){2}(?:.(?:[1-9]d?|1dd|2[0-4]d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:.(?:[a-z\u00a1-\uffff]{2,})))(?::d{2,5})?(?:/S*)?$'
  );
  /* eslint-enable */
  return pattern.test(text);
};

const applyWebLinkFormat = ({ getState, item, setState }) => {
  const { selection, text } = getState();
  let newText;
  let newSelection;
  const writeUrlTextHere = 'https://zulipchat.com';
  const writeTextHereString = 'Write some text here';
  const selectedText = text.substring(selection.start, selection.end);
  if (selection.start !== selection.end) {
    if (isStringWebLink(selectedText)) {
      newText = replaceBetween(text, selection, `[${writeTextHereString}](${selectedText})`);
      newSelection = {
        start: selection.start + 1,
        end: selection.start + 1 + writeTextHereString.length
      };
    } else {
      newText = replaceBetween(text, selection, `[${selectedText}](${writeUrlTextHere})`);
      newSelection = {
        start: selection.end + 3,
        end: selection.end + 3 + writeUrlTextHere.length
      };
    }
  } else {
    newText = replaceBetween(text, selection, `[${writeTextHereString}](${writeUrlTextHere})`);
    newSelection = {
      start: selection.start + 1,
      end: selection.start + 1 + writeTextHereString.length
    };
  }
  setState({ text: newText }, () => {
    setTimeout(() => {
      setState({ selection: newSelection });
    }, 25);
  });
};

const applyListFormat = ({ getState, item, setState }) => {
  let { text } = getState();
  const { selection } = getState();
  text = text || '';
  let newText;
  let newSelection;

  if (selection.start !== selection.end) {
    newText = replaceBetween(
      text,
      selection,
      `\n${item.prefix} ${text.substring(selection.start, selection.end)} `
    );
    newSelection = { start: selection.end + 2, end: selection.end + 2 };
  } else if (selection.start < text.length && text.charAt(selection.start + 1) === '\n') {
    // Caret at last position of the line
    newText = replaceBetween(text, selection, `\n ${item.prefix} `);
    newSelection = { start: selection.start + 3, end: selection.start + 3 };
  } else if (selection.start === selection.end) {
    newText = replaceBetween(text, selection, `\n ${item.prefix} `);
    newSelection = { start: selection.start + 4, end: selection.start + 4 };
  }

  setState({ text: newText }, () => {
    setTimeout(() => {
      setState({ selection: newSelection });
    }, 300);
  });
};
export const FORMATS = [
  { key: 'B', wrapper: '**', onPress: applyWrapFormat, icon: 'format-bold' },
  { key: 'I', wrapper: '*', onPress: applyWrapFormat, icon: 'format-italic' },
  { key: 'U', wrapper: '_', onPress: applyWrapFormat, icon: 'format-underline' },
  { key: 'S', wrapper: '~~', onPress: applyWrapFormat, icon: 'format-strikethrough' },
  { key: 'C', wrapper: '`', onPress: applyWrapFormat, icon: 'code-tags' },
  { key: 'CC', wrapper: '```', onPress: applyWrapFormatNewLines, icon: 'code-braces' },
  { key: 'L', prefix: '-', onPress: applyListFormat, icon: 'format-list-bulleted' },
  { key: 'WEB', onPress: applyWebLinkFormat, icon: 'link' }
];

const inlinePadding = { padding: 8 };

const renderButton = ({ item, getState, setState }) =>
  item.icon
    ? <IconMaterialCommunity
        name={item.icon}
        onPress={() => item.onPress({ getState, setState, item })}
        size={28}
        style={inlinePadding}
        color={BORDER_COLOR}
      />
    : <Button
        title={item.key}
        onPress={() => item.onPress({ getState, setState, item })}
        color={BORDER_COLOR}
        style={inlinePadding}
      />;

export const renderFormatButtons = ({ getState, setState }) => {
  const list = (
    <FlatList
      data={FORMATS}
      keyboardShouldPersistTaps="always"
      renderItem={({ item, index }) => renderButton({ item, getState, setState })}
      horizontal
    />
  );
  return list;
};
