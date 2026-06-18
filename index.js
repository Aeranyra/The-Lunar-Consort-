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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const data = getUser(interaction.user.id);
  const target = interaction.options.getUser("target");

  // 🎲 MISS
  if (interaction.commandName === "miss") {
    data.longing += 2;
    data.distance += 1;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🌙 You miss ${target}. The silence deepens.`,
            `🌫️ Thoughts of ${target} drift further away.`,
            `🕯️ Missing recorded. Emotional gap expands.`,
            `🌙 The moon notes your longing for ${target}.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 🕯️ REMEMBER
  if (interaction.commandName === "remember") {
    data.memory += 2;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🕯️ A memory of ${target} resurfaces.`,
            `🌫️ Time refuses to erase ${target}.`,
            `🌙 You remember ${target} too clearly.`,
            `🖤 Something about ${target} remains unchanged.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 🌫️ YEARN
  if (interaction.commandName === "yearn") {
    data.obsession += 2;
    data.longing += 1;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🌫️ You yearn for ${target}.`,
            `🕯️ Desire for ${target} refuses to fade.`,
            `🌙 The thought of ${target} lingers too long.`,
            `🖤 Some feelings become heavier over time.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 👁️ WATCH
  if (interaction.commandName === "watch") {
    data.echo += 1;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `👁️ You watch ${target} silently.`,
            `🌫️ ${target} is observed from afar.`,
            `🕯️ Presence noted. No interaction occurs.`,
            `🌙 You remain unseen while observing ${target}.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 🌫️ FADE
  if (interaction.commandName === "fade") {
    data.distance += 2;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🌫️ Your connection with ${target} fades.`,
            `🕯️ Emotional distance increases.`,
            `🌙 ${target} slips further away.`,
            `🖤 Something between you dissolves quietly.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 🖤 IGNORE
  if (interaction.commandName === "ignore") {
    data.silence += 2;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🖤 You ignore ${target}.`,
            `🌫️ Silence replaces response.`,
            `🕯️ No acknowledgment is given.`,
            `🌙 You choose absence over reaction.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 🕯️ ACCUSE
  if (interaction.commandName === "accuse") {
    data.tension += 2;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🕯️ You accuse ${target}.`,
            `🌫️ Tension rises without resolution.`,
            `🌙 Words are unspoken but heavy.`,
            `🖤 Something breaks in silence.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 🖤 BETRAY
  if (interaction.commandName === "betray") {
    data.tension += 4;
    data.distance += 2;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🖤 You betray ${target}.`,
            `🌫️ Trust fractures between you.`,
            `🕯️ The moon records another betrayal.`,
            `🌙 Some bonds are not meant to survive.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 📖 PROFILE
  if (interaction.commandName === "profile") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🌙 Lunar Consort Profile")
          .setDescription(
`Longing: ${data.longing}
Memory: ${data.memory}
Distance: ${data.distance}
Silence: ${data.silence}
Echo: ${data.echo}
Obsession: ${data.obsession}
Tension: ${data.tension}`
          )
          .setFooter({
            text: "🕯️ Emotional state archived."
          })
          .setTimestamp()
      ]
    });
  }

  // 📜 HELP
  if (interaction.commandName === "help") {
    return interaction.reply({
      embeds: [
        makeEmbed(
`🌙 Lunar Consort

💔 Longing
/miss /remember /yearn

🌫️ Distance
/fade /ignore

👁️ Observation
/watch

🕯️ Secrets & Conflict
/accuse /betray

📖 Personal
/profile /help`
        )
      ]
    });
  }
});
// 🚀 LOGIN
client.login(process.env.DISCORD_TOKEN);
