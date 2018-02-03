/* @flow */
import config from '../config';

import { topicNarrow, privateNarrow } from '../utils/narrow';
import type { Actions } from '../types';

export const handleNotification = (
  data: Object,
  anchor: number,
  pending: boolean,
  doNarrowAtAnchor: Actions.doNarrow,
): void => {
  if (!data || !data.recipient_type) return;

  const narrow =
    data.recipient_type === 'stream'
      ? topicNarrow(data.stream, data.topic)
      : privateNarrow(data.sender_email);

  if (pending) {
    config.startup.narrow = narrow;
    config.startup.anchor = anchor;
  } else {
    setTimeout(() => doNarrowAtAnchor(narrow, anchor), 100);
  }
};
