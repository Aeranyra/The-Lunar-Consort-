console.log("TOKEN CHECK:", process.env.DISCORD_TOKEN);require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🌙 Lunar Consort is online`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content === "!miss") {
    message.reply("🌙 Missing recorded. No response will return.");
  }

  if (message.content === "!echo") {
    message.reply("🕯️ An echo remains, but it does not answer.");
  }

  if (message.content === "!distance") {
    message.reply("🌫️ Distance: drifting.");
  }
});

client.login(process.env.DISCORD_TOKEN);
