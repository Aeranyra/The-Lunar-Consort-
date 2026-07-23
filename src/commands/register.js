const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const { commandDescriptions, noTargetCommands } = require("../content");

const TARGET_COMMANDS = [
  "miss",
  "remember",
  "yearn",
  "watch",
  "fade",
  "ignore",
  "accuse",
  "betray",
  "slap",
  "kill",
  "random",
  "confess",
  "expose",
  "resent",
  "linger",
  "haunt",
  "curse",
  "worship",
];

const STAT_CHOICES = [
  { name: "Total (all stats combined)", value: "total" },
  { name: "Longing", value: "longing" },
  { name: "Memory", value: "memory" },
  { name: "Distance", value: "distance" },
  { name: "Silence", value: "silence" },
  { name: "Echo", value: "echo" },
  { name: "Obsession", value: "obsession" },
  { name: "Tension", value: "tension" },
  { name: "Betrayal", value: "betrayal" },
  { name: "Confession", value: "confession" },
  { name: "Exposure", value: "exposure" },
  { name: "Resentment", value: "resentment" },
  { name: "Lingering", value: "lingering" },
  { name: "Haunting", value: "haunting" },
  { name: "Cursing", value: "cursing" },
  { name: "Worship", value: "worshipping" },
  { name: "Watching", value: "watching" },
];

function buildCommands() {
  const builders = [...TARGET_COMMANDS, ...noTargetCommands].map((name) => {
    const builder = new SlashCommandBuilder()
      .setName(name)
      .setDescription(commandDescriptions[name] || `Lunar command: ${name}`);

    if (TARGET_COMMANDS.includes(name)) {
      builder.addUserOption((opt) =>
        opt.setName("target").setDescription("Target user").setRequired(true)
      );
    }

    if (name === "profile") {
      builder.addUserOption((opt) =>
        opt.setName("user").setDescription("User to view profile (optional)").setRequired(false)
      );
    }

    if (name === "top") {
      builder.addStringOption((opt) =>
        opt
          .setName("stat")
          .setDescription("Which stat to rank by (default: total)")
          .setRequired(false)
          .addChoices(...STAT_CHOICES)
      );
    }

    return builder.toJSON();
  });

  const shipCommand = new SlashCommandBuilder()
    .setName("ship")
    .setDescription(commandDescriptions.ship)
    .addUserOption((opt) =>
      opt.setName("user1").setDescription("First user").setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("user2").setDescription("Second user (defaults to you)").setRequired(false)
    )
    .toJSON();

  return [...builders, shipCommand];
}

async function registerCommands(token, clientId, guildId) {
  const rest = new REST({ version: "10" }).setToken(token);
  const commands = buildCommands();

  try {
    console.log("🌙 Clearing and registering commands...");
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log("✅ Commands registered successfully.");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
    throw err;
  }
}

module.exports = { registerCommands, buildCommands };
