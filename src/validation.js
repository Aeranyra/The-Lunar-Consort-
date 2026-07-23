// Commands exempt from all target restrictions — self and bot targets
// are both allowed (e.g. it's funny to /slap yourself or a bot).
const NO_RESTRICTIONS_COMMANDS = new Set(["slap", "kill"]);

// Returns an error string if the target is invalid, or null if it's fine.
function validateTarget(commandName, invokerId, targetUser) {
  if (NO_RESTRICTIONS_COMMANDS.has(commandName)) {
    return null;
  }
  if (targetUser.bot) {
    return "🌙 The moon does not answer for bots.";
  }
  return null;
}

module.exports = { validateTarget };
