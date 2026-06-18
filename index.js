const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

// 🌙 CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🧠 MEMORY SYSTEM
const memory = new Map();

function getUser(id) {
  if (!memory.has(id)) {
    memory.set(id, {
      longing: 0,
      memory: 0,
      distance: 0,
      silence: 0,
      echo: 0,
      obsession: 0,
      tension: 0
    });
  }
  return memory.get(id);
}

// 🎲 RANDOM PICKER
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🌙 EMBED BUILDER
function makeEmbed(text) {
  return new EmbedBuilder()
    .setTitle("🌙 Lunar Consort")
    .setDescription(text)
    .setFooter({
      text: "🕯️ The moon remembers what people pretend to forget."
    })
    .setTimestamp();
}

// 🌙 COMMAND LIST (REGISTERED SLASH COMMANDS)
const commands = [

  new SlashCommandBuilder()
    .setName("miss")
    .setDescription("Feel longing toward someone")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who you miss")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("remember")
    .setDescription("Recall a memory of someone")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who you remember")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("yearn")
    .setDescription("Yearn for someone")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who you yearn for")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Observe someone silently")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who you observe")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("fade")
    .setDescription("Distance increases between you and someone")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who fades")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ignore")
    .setDescription("Ignore someone emotionally")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who you ignore")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("accuse")
    .setDescription("Express emotional accusation")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who you accuse")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("betray")
    .setDescription("Break trust")
    .addUserOption(o =>
      o.setName("target")
        .setDescription("Who you betray")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your emotional state"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View Lunar Consort commands")

].map(c => c.toJSON());

// 🔗 DISCORD REST REGISTER
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("🌙 Lunar Consort commands registered");
}

// 🌙 READY EVENT
client.once("ready", async () => {
  console.log("🌙 Lunar Consort ONLINE");
  await registerCommands();
});

// 🚀 LOGIN
client.login(process.env.DISCORD_TOKEN);
