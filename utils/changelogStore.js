// Tracks which changelog VERSION_LABEL (from config/changelog.js) was last
// posted to each guild's front-desk channel, so restarts that aren't a real
// update (e.g. Render waking from sleep) don't repost the same notes.

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'config', 'changelogPosted.json');

function readAll() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    return {};
  }
}

function writeAll(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[ChangelogStore] Failed to persist last-posted version:', err.message);
  }
}

function getLastPostedVersion(guildId) {
  const all = readAll();
  return all[guildId] || null;
}

function setLastPostedVersion(guildId, version) {
  const all = readAll();
  all[guildId] = version;
  writeAll(all);
}

module.exports = { getLastPostedVersion, setLastPostedVersion };
