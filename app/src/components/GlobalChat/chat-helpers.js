import Autolinker from 'autolinker';
import emojione from 'emojione';

const SafeLinks = [
  'google.com',
  'bot.seuntjie.com',
  'seuntjie.com',
  'youtube.com',
  'sites.google.com',
  'dicesites.com',
  'twitter.com',
  'facebook.com',
  'imgur.com',
  'reddit.com',
  'betking.io',
  'test.betking.io'
];

export const encodeEmoji = str => {
  emojione.ascii = true;
  return emojione.shortnameToUnicode(str);
};

const extractDomain = (url) => {
  return url.split('/')[0];
};

const highlightMention = (message, username) => {
  if (message.indexOf(username) > -1) {
    return message.replace(`@${username}`, `<span class='mention'>@${username}</span>`);
  }
  return message;
};

const filterURL = (match) => {
  if (match.getType() === 'url') {
    if (SafeLinks.indexOf(extractDomain(match.getAnchorText().toLowerCase())) > -1) {
      return true;
    }
    return new Autolinker.HtmlTag({
      tagName: 'a',
      attrs: {'title': `Load URL: ${match.getAnchorHref()}`, 'href': match.getUrl(), 'class': 'external-link', 'rel': 'noreferrer', 'target': '_blank'},
      innerHtml: '[External Link]'
    });
  }
};

const testIfBetChunk = (chunk) => {
  let isValidBetChunk = false;
  let betId = null;
  if (typeof chunk === 'string') {
    const lowercaseChunk = chunk.trim().toLowerCase();
    const testBetId = lowercaseChunk.replace('b:', '');
    if (lowercaseChunk.indexOf('b:') === 0 && !isNaN(testBetId)) {
      isValidBetChunk = true;
      betId = testBetId;
    }
  }
  return {isValidBetChunk, betId};
};

const testIfUserChunk = (chunk) => {
  let isValidUserChunk = false;
  let username = null;
  if (typeof chunk === 'string') {
    const lowercaseChunk = chunk.trim().toLowerCase();
    const testUsername = lowercaseChunk.replace('u:', '');
    if (lowercaseChunk.indexOf('u:') === 0 && testUsername.length > 0) {
      isValidUserChunk = true;
      username = testUsername;
    }
  }
  return {isValidUserChunk, username};
};

const linkUsersAndBets = (message) => {
  const msgChunks = message.split(' ');
  for (let i = 0; i < msgChunks.length; i++) {
    const chunk = msgChunks[i];
    const {isValidBetChunk, betId} = testIfBetChunk(chunk);
    const {isValidUserChunk, username} = testIfUserChunk(chunk);
    if (isValidBetChunk) {
      msgChunks[i] = `<a href="#" class="chat-body-betid" data-id="${betId}">bet #${betId}</a>`;
    }
    if (isValidUserChunk) {
      msgChunks[i] = `<a href="#" class="chat-body-username" data-username="${username}">${username}</a>`;
    }
  }
  return msgChunks.join(' ');
};

export const formatMessage = (message, username) => {
  let formattedMessage = message.replace(/<(?:.|\n)*?>/gm, '');
  formattedMessage = highlightMention(formattedMessage, username);
  formattedMessage = linkUsersAndBets(formattedMessage);
  formattedMessage = encodeEmoji(formattedMessage);
  formattedMessage = Autolinker.link(formattedMessage, {
    truncate: 30,
    replaceFn (match) {
      return filterURL(match);
    }
  });
  return formattedMessage;
};

export const sortUsers = (u1, u2, moderators) => {
  const U = (str) => str.toUpperCase();
  const byName = (u1, u2) => {
    if (U(u1) === U(u2)) return 0;
    else if (U(u1) < U(u2)) return -1;
    else return 1;
  };

  if (moderators.indexOf(u1) !== -1 && moderators.indexOf(u2) !== -1) {
    return byName(u1, u2);
  } else if (moderators.indexOf(u1) !== -1 && moderators.indexOf(u2) === -1) {
    return -1;
  } else if (moderators.indexOf(u1) === -1 && moderators.indexOf(u2) !== -1) {
    return 1;
  } else {
    return byName(u1, u2);
  }
};
