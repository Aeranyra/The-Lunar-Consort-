require("dotenv").config();
const http = require("http");
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const { loadData, saveData } = require("./src/data");
const { registerCommands } = require("./src/commands/register");
const { handleInteraction } = require("./src/commands/handlers");
const { findChannelByName } = require("./utils/channelMatch");
const { getLastPostedVersion, setLastPostedVersion } = require("./utils/changelogStore");
const {
  BOT_NAME,
  EMBED_COLOR,
  VERSION_LABEL,
  NOTES,
  CATEGORY_LABELS,
  FRONT_DESK_CHANNEL_NAME,
} = require("./config/changelog");

// ENV VALIDATION
const REQUIRED_ENV = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variable(s): ${missingEnv.join(", ")}`);
  process.exit(1);
}

// DUMMY HTTP SERVER — Discord bots don't need a port, but Render's Web
// Service tier checks for one to confirm the app is alive. This just
// answers "ok" so Render's port scan passes; it does nothing else.
const PORT = process.env.PORT || 3000;
let botStatus = "starting";

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Lunar Consort is ${botStatus}.`);
  })
  .listen(PORT, () => {
    console.log(`🌐 Dummy HTTP server listening on port ${PORT} (for Render's health check)`);
  });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// FRONT-DESK CHANGELOG — posts a "back online" embed (with what's new, the
// first time a given VERSION_LABEL is seen) to #front-desk in every guild.
async function postFrontDeskUpdate(readyClient) {
  const hasAnyNotes = Object.values(NOTES).some((list) => Array.isArray(list) && list.length > 0);

  for (const guild of readyClient.guilds.cache.values()) {
    try {
      const channel = findChannelByName(guild, FRONT_DESK_CHANNEL_NAME);
      if (!channel) {
        console.log(`[FrontDesk] No channel matching "#${FRONT_DESK_CHANNEL_NAME}" found in guild "${guild.name}" — skipping startup post.`);
        continue;
      }

      const botPerms = channel.permissionsFor(readyClient.user);
      if (!botPerms || !botPerms.has(PermissionFlagsBits.SendMessages) || !botPerms.has(PermissionFlagsBits.ViewChannel)) {
        console.log(`[FrontDesk] Missing send/view permission in #${channel.name} in "${guild.name}" — skipping startup post.`);
        continue;
      }

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`✅ ${BOT_NAME} is back online`)
        .setDescription(`Systems restored, and ready to be of service in **${guild.name}**.`)
        .setTimestamp();

      // Only show notes if VERSION_LABEL hasn't already been posted here —
      // avoids reposting the same changelog on every restart.
      const alreadyPosted = getLastPostedVersion(guild.id) === VERSION_LABEL;

      if (hasAnyNotes && !alreadyPosted) {
        embed.addFields({ name: `📋 What's New — ${VERSION_LABEL}`, value: "\u200b" });
        for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
          const items = NOTES[key];
          if (!items || items.length === 0) continue;
          embed.addFields({ name: label, value: items.map((n) => `• ${n}`).join("\n") });
        }
      }

      await channel.send({ embeds: [embed] });

      if (!alreadyPosted) {
        setLastPostedVersion(guild.id, VERSION_LABEL);
      }
    } catch (err) {
      console.error(`[FrontDesk] Failed to post startup update in guild "${guild.name}":`, err.message);
    }
  }
}

async function postFrontDeskShutdown() {
  if (!client.user) return; // never finished logging in — nothing to announce as

  for (const guild of client.guilds.cache.values()) {
    try {
      const channel = findChannelByName(guild, FRONT_DESK_CHANNEL_NAME);
      if (!channel) continue;

      const botPerms = channel.permissionsFor(client.user);
      if (!botPerms || !botPerms.has(PermissionFlagsBits.SendMessages) || !botPerms.has(PermissionFlagsBits.ViewChannel)) continue;

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(`🔧 ${BOT_NAME} is stepping away for maintenance`)
        .setDescription(`Restarting to apply updates in **${guild.name}** — back shortly.`)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(`[FrontDesk] Failed to post shutdown notice in guild "${guild.name}":`, err.message);
    }
  }
}

client.once("clientReady", (readyClient) => {
  botStatus = "online";
  console.log(`🌙 Lunar Consort ONLINE as ${readyClient.user.tag}`);
  postFrontDeskUpdate(readyClient);
});

client.on("interactionCreate", handleInteraction);

loadData();

registerCommands(process.env.DISCORD_TOKEN, process.env.CLIENT_ID, process.env.GUILD_ID)
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch((err) => {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  });

// GRACEFUL SHUTDOWN — save lunar memory and post the front-desk maintenance
// notice before exiting. Capped at 8s total so a slow/failed Discord call
// never blocks the process from actually exiting on redeploy.
let isShuttingDown = false;
async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`🌙 Received ${signal}, saving lunar memory and notifying front-desk before exit...`);

  saveData();

  await Promise.race([
    postFrontDeskShutdown().catch((err) => console.error("[Shutdown] Error posting shutdown notice:", err)),
    new Promise((resolve) => setTimeout(resolve, 8000)),
  ]);

  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
