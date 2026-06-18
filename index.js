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

// 🧠 MEMORY
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

// 🌙 EMBED
function makeEmbed(text) {
  return new EmbedBuilder()
    .setTitle("🌙 Lunar Consort")
    .setDescription(text)
    .setFooter({ text: "🕯️ The moon remembers what people forget." })
    .setTimestamp();
}

// 📜 COMMANDS
const commands = [
  new SlashCommandBuilder()
    .setName("miss")
    .setDescription("Feel longing toward someone")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you miss").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("remember")
    .setDescription("Recall a memory of someone")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you remember").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("yearn")
    .setDescription("Yearn for someone")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you yearn for").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Observe someone silently")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you watch").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("fade")
    .setDescription("Distance increases")
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
    .setDescription("Express accusation")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you accuse").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("betray")
    .setDescription("Break trust")
    .addUserOption(o =>
      o.setName("target").setDescription("Who you betray").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View emotional state"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View commands")
].map(c => c.toJSON());

// 🔗 REGISTER COMMANDS
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("🌙 Commands registered");
}

// 🌙 READY
client.once("ready", async () => {
  console.log("🌙 Lunar Consort ONLINE");
  await registerCommands();
});

// 🎭 COMMAND HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const data = getUser(interaction.user.id);
  const target = interaction.options.getUser("target");

  // 🌙 MISS
  if (interaction.commandName === "miss") {
    data.longing += 2;
    data.distance += 1;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🌙 You miss ${target}. The silence deepens.`,
            `🌫️ Thoughts of ${target} drift away.`,
            `🕯️ Missing recorded. Emotional gap expands.`
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
            `🌙 Time refuses to erase ${target}.`,
            `🌫️ You remember ${target} too clearly.`
          ])
        )
      ],
      allowedMentions: { users: [target.id] }
    });
  }

  // 🌫️ YEARN
  if (interaction.commandName === "yearn") {
    data.obsession += 2;

    return interaction.reply({
      embeds: [
        makeEmbed(
          pick([
            `🌫️ You yearn for ${target}.`,
            `🕯️ Desire refuses to fade.`,
            `🌙 The thought of ${target} lingers.`
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
            `🌫️ ${target} is observed.`,
            `🕯️ No interaction occurs.`
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
            `🌫️ Connection with ${target} fades.`,
            `🕯️ Emotional distance grows.`,
            `🌙 ${target} slips away.`
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
            `🕯️ No acknowledgment is given.`
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
            `🌫️ Tension rises.`,
            `🌙 Words remain unspoken.`
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
            `🌫️ Trust breaks.`,
            `🕯️ The moon records it.`
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
          .setFooter({ text: "🕯️ Emotional state archived." })
      ]
    });
  }

  // 📜 HELP
  if (interaction.commandName === "help") {
    return interaction.reply({
      embeds: [
        makeEmbed(`
🌙 Lunar Consort

💔 /miss /remember /yearn
🌫️ /fade /ignore
👁️ /watch
🖤 /accuse /betray
📖 /profile /help
        `)
      ]
    });
  }
});

// 🚀 LOGIN (FINAL LINE)
client.login(process.env.DISCORD_TOKEN);
