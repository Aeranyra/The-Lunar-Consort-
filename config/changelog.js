/**
 * FRONT-DESK CHANGELOG — Lunar Consort
 *
 * Edit VERSION_LABEL + NOTES before each update, then deploy. The bot
 * posts this to #front-desk automatically, labeled "The Lunar Consort" so
 * it's distinguishable from other bots posting to the same channel.
 */

const BOT_NAME = 'The Lunar Consort';

// Matches the bot's existing embed theme color (see src/embeds.js).
const EMBED_COLOR = 0x4a4a6b;

const VERSION_LABEL = 'v1.2.0';

const NOTES = {
  newCommands: [
    '/ship — see how two souls are bound under the moon',
  ],
  newFeatures: [
    '/reset now asks for confirmation before erasing your profile',
    '/confess, /expose, /resent, /linger, /haunt, /curse, /worship, and /watch now track their own stats',
  ],
  bugFixes: [
    'Fixed slash command registration failure caused by option ordering on /ship',
    'Fixed deploy failing Render\'s health check by adding a lightweight status server',
  ],
  changes: [
    '/slap and /kill can now target yourself or a bot; other commands still block bot targets',
    'Per-command cooldowns instead of one flat cooldown for every command',
  ],
  maintenance: [
    'Split the bot into focused modules (data, content, embeds, moon phase, cooldowns, validation, commands)',
  ],
};

const CATEGORY_LABELS = {
  newCommands: '🆕 New Commands',
  newFeatures: '✨ New Features',
  bugFixes: '🔧 Bug Fixes',
  changes: '🛠️ Changes',
  maintenance: '📢 Maintenance',
};

// Keep this the same across all bots sharing the channel.
const FRONT_DESK_CHANNEL_NAME = 'front-desk';

module.exports = { BOT_NAME, EMBED_COLOR, VERSION_LABEL, NOTES, CATEGORY_LABELS, FRONT_DESK_CHANNEL_NAME };
