const DEFAULT_COOLDOWN_MS = 10_000;

// Override the default cooldown for specific commands.
const COOLDOWN_OVERRIDES_MS = {
  reset: 30_000,
  top: 5_000,
  help: 3_000,
  profile: 5_000,
  fortune: 8_000,
};

const cooldowns = new Map();

function getCooldownMs(cmd) {
  return COOLDOWN_OVERRIDES_MS[cmd] ?? DEFAULT_COOLDOWN_MS;
}

// Returns true (and does nothing else) if the user is still on cooldown.
// Otherwise records the current attempt and returns false.
function checkCooldown(userId, cmd) {
  if (!cooldowns.has(userId)) cooldowns.set(userId, {});
  const userCds = cooldowns.get(userId);
  const now = Date.now();
  const limit = getCooldownMs(cmd);

  if (userCds[cmd] && now - userCds[cmd] < limit) {
    return true;
  }
  userCds[cmd] = now;
  return false;
}

module.exports = { checkCooldown, getCooldownMs };
