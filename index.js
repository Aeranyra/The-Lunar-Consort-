const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 🌙 MEMORY SYSTEM
const memory = new Map();

function getUser(id) {
  if (!memory.has(id)) {
    memory.set(id, {
      affection: 0,
      distance: 0,
      longing: 0,
      silence: 0,
      echo: 0
    });
  }
  return memory.get(id);
}

// 🎲 RANDOM PICK
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🌙 SLASH COMMANDS
const commands = [
  new SlashCommandBuilder().setName("miss").setDescription("Record longing"),
  new SlashCommandBuilder().setName("echo").setDescription("Trigger echo memory"),
  new SlashCommandBuilder().setName("sad").setDescription("Register sadness"),
  new SlashCommandBuilder().setName("slap").setDescription("Break emotional link"),
  new SlashCommandBuilder().setName("profile").setDescription("View emotional state")
].map(cmd => cmd.toJSON());

// 🔗 REGISTER COMMANDS (IMPORTANT)
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("🌙 Slash commands registered");
}

client.once("ready", async () => {
  console.log("🌙 Lunar Consort Slash Engine ONLINE");
  await registerCommands();
});

// 💔 COMMAND HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const data = getUser(interaction.user.id);

  // 🌙 MISS
  if (interaction.commandName === "miss") {
    data.longing += 2;
    data.distance += 1;

    return interaction.reply(
      pick([
        "🌙 Missing recorded. No reply will return.",
        "🌫️ Emotional absence noted.",
        "🕯️ The system registers distance."
      ])
    );
  }

  // 🕯️ ECHO
  if (interaction.commandName === "echo") {
    data.echo += 2;

    return interaction.reply(
      pick([
        "🕯️ An echo remains. It does not speak.",
        "🌫️ Something lingers in silence.",
        "🌙 Echo detected."
      ])
    );
  }

  // 🌫️ SAD
  if (interaction.commandName === "sad") {
    data.silence += 2;

    return interaction.reply(
      pick([
        "🌫️ Sadness recorded without resolution.",
        "🕯️ Emotion acknowledged.",
        "🌙 The system remains unchanged."
      ])
    );
  }

  // 🖤 SLAP
  if (interaction.commandName === "slap") {
    data.distance += 2;

    return interaction.reply(
      pick([
        "🌫️ Connection briefly interrupted.",
        "🕯️ Emotional shift detected.",
        "🌙 Bond weakened."
      ])
    );
  }

  // 🖤 PROFILE
  if (interaction.commandName === "profile") {
    return interaction.reply(
`🌙 Lunar Consort Profile

Affection: ${data.affection}
Distance: ${data.distance}
Longing: ${data.longing}
Silence: ${data.silence}
Echo: ${data.echo}`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
