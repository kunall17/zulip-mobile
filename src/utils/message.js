import { Recipient } from '../types';

export const normalizeRecipients = (recipients: Recipient[]) =>
  (!Array.isArray(recipients) ?
    recipients :
    recipients
      .map((s) => s.email.trim())
      .filter(x => x.length > 0)
      .sort()
      .join(','));

export const normalizeRecipientsSansMe = (recipients: Recipient[], selfEmail) => (
  recipients.length === 1 ?
    recipients[0].email :
    normalizeRecipients(recipients.filter(r => r.email !== selfEmail))
);

export const isSameRecipient = (msg1, msg2): boolean => {
  if (msg1 === undefined || msg2 === undefined) {
    return false;
  }

  if (msg1.type !== msg2.type) {
    return false;
  }

  switch (msg1.type) {
    case 'private':
      return (normalizeRecipients(msg1.display_recipient).toLowerCase() ===
              normalizeRecipients(msg2.display_recipient).toLowerCase());
    case 'stream':
      return (msg1.display_recipient.toLowerCase() === msg2.display_recipient.toLowerCase() &&
              msg1.subject.toLowerCase() === msg2.subject.toLowerCase());
    default:
      // Invariant
      return false;
  }
};

export const isTopicMuted = (message, mute = []): boolean => {
  if (typeof message.display_recipient !== 'string') {
    return false; // private/group messages are not muted
  }
  return mute.some(x => x[0] === message.display_recipient && x[1] === message.subject);
};

export const shouldBeMuted = (msg, narrow, subscriptions, mutes = []): boolean => {
  if (typeof msg.display_recipient !== 'string') {
    return false; // private/group messages are not muted
  }

  if (narrow.length === 0) {
    const sub = subscriptions.find(x => x.name === msg.display_recipient);
    if (sub && !sub.in_home_view) {
      return true;
    }
  }

  return mutes.some(x => x[0] === msg.display_recipient && x[1] === msg.subject);
};
