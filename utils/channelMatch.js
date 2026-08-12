/**
 * Many servers prefix channel names with an emoji or separator typed into
 * the name (e.g. "📝︱bot-logs" instead of plain "bot-logs"), or use slightly
 * different punctuation than what's configured in code. Discord channel
 * names are usually already lowercase/hyphenated, but a strict
 * `channel.name === 'bot-logs'` check still fails on any extra emoji or
 * separator character. This normalizes both sides before comparing.
 */
function normalizeChannelName(str) {
  if (!str) return '';
  return str
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // strip emoji/symbols/separators, keep letters/numbers/space/hyphen
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Finds a guild channel matching `targetName` (emoji/separator-insensitive).
 * Falls back to a "contains" match if no exact normalized match is found,
 * so "📝︱bot-logs-archive" style names still resolve for a configured
 * "bot-logs" target.
 */
function findChannelByName(guild, targetName) {
  const target = normalizeChannelName(targetName);
  if (!target || !guild) return undefined;

  const channels = [...guild.channels.cache.values()];

  const exact = channels.find(c => normalizeChannelName(c.name) === target);
  if (exact) return exact;

  return channels.find(c => normalizeChannelName(c.name).includes(target));
}

module.exports = { normalizeChannelName, findChannelByName };
