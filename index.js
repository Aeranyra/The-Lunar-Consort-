const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const memory = new Map();

// 🌙 GET USER MEMORY
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

// 🎲 RANDOM PICKER
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ---------------- COMMANDS ---------------- */

const commands = [
  new SlashCommandBuilder()
    .setName("miss")
    .setDescription("Feel longing toward someone")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you miss").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Observe someone silently")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you observe").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("fade")
    .setDescription("Distance increases between you and someone")
    .addUserOption(o =>
      o.setName("target").setDescription("Who fades").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ignore")
    .setDescription("Ignore someone emotionally")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you ignore").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("accuse")
    .setDescription("Express emotional accusation")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you accuse").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your emotional state")
].map(c => c.toJSON());

/* ---------------- REGISTER COMMANDS ---------------- */

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function register() {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("🌙 Lunar Consort commands registered");
}

/* ---------------- READY ---------------- */

client.once("ready", async () => {
  console.log("🌙 Lunar Consort ONLINE");
  await register();
});

/* ---------------- COMMAND HANDLER ---------------- */

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const data = getUser(interaction.user.id);

  const target = interaction.options.getUser("target");

  /* 🌙 MISS */
  if (interaction.commandName === "miss") {
    data.longing += 2;
    data.distance += 1;

    return interaction.reply(
      pick([
        `🌙 You miss ${target.username}… the silence deepens.`,
        `🌫️ ${target.username} drifts further in memory.`,
        `🕯️ Missing recorded. Emotional gap expands.`
      ])
    );
  }

  /* 👁 WATCH */
  if (interaction.commandName === "watch") {
    return interaction.reply(
      pick([
        `🌙 You watch ${target.username} from a distance.`,
        `🌫️ ${target.username} is being observed silently.`,
        `🕯️ Presence noted. No interaction occurs.`
      ])
    );
  }

  /* 🌫 FADE */
  if (interaction.commandName === "fade") {
    data.distance += 2;

    return interaction.reply(
      pick([
        `🌫️ Connection to ${target.username} begins to fade.`,
        `🕯️ Emotional link weakening.`,
        `🌙 ${target.username} slips further away.`
      ])
    );
  }

  /* 🖤 IGNORE */
  if (interaction.commandName === "ignore") {
    data.silence += 2;

    return interaction.reply(
      pick([
        `🌫️ You ignore ${target.username}.`,
        `🕯️ Silence replaces response.`,
        `🌙 No acknowledgment is given.`
      ])
    );
  }

  /* 🕯 ACCUSE */
  if (interaction.commandName === "accuse") {
    data.echo += 1;

    return interaction.reply(
      pick([
        `🕯️ You accuse ${target.username} in silence.`,
        `🌫️ Emotional tension increases.`,
        `🌙 Words remain unspoken, but recorded.`
      ])
    );
  }

  /* 🌙 PROFILE */
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

/* ---------------- LOGIN ---------------- */

client.login(process.env.DISCORD_TOKEN);
