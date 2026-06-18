const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;

client.once("ready", () => {
  console.log("🌙 Lunar Consort is ONLINE");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!miss") {
    message.reply("🌙 Missing recorded.");
  }

  if (message.content === "!echo") {
    message.reply("🕯️ Echo exists.");
  }
});

if (!TOKEN) {
  console.log("❌ TOKEN MISSING");
} else {
  client.login(TOKEN);
}
