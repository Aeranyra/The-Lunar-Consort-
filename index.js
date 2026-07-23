require("dotenv").config();
const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");

const { loadData, saveData } = require("./src/data");
const { registerCommands } = require("./src/commands/register");
const { handleInteraction } = require("./src/commands/handlers");

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

client.once("clientReady", () => {
  botStatus = "online";
  console.log(`🌙 Lunar Consort ONLINE as ${client.user.tag}`);
});

client.on("interactionCreate", handleInteraction);

loadData();

registerCommands(process.env.DISCORD_TOKEN, process.env.CLIENT_ID, process.env.GUILD_ID)
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch((err) => {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  });

// GRACEFUL SHUTDOWN — make sure the last write isn't lost on restart/redeploy
function shutdown(signal) {
  console.log(`🌙 Received ${signal}, saving lunar memory before exit...`);
  saveData();
  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
