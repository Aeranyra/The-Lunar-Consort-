require("dotenv").config();

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
    .setFooter({ text: "🕯️ The moon remembers what people forget." })
    .setTimestamp();
}

// 📜 COMMANDS
const commands = [
  new SlashCommandBuilder().setName("miss").setDescription("Miss someone")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("remember").setDescription("Remember someone")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("yearn").setDescription("Yearn for someone")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("watch").setDescription("Watch someone")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("fade").setDescription("Distance grows")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("ignore").setDescription("Ignore someone")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("accuse").setDescription("Accuse someone")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("betray").setDescription("Betray someone")
    .addUserOption(o => o.setName("target").setDescription("Who").setRequired(true)),

  new SlashCommandBuilder().setName("profile").setDescription("View profile"),

  new SlashCommandBuilder().setName("help").setDescription("Help menu")
].map(c => c.toJSON());

// 🔗 REGISTER
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

  try {
    const data = getUser(interaction.user.id);

    // ───────── MISS ─────────
    if (interaction.commandName === "miss") {
      const target = interaction.options.getUser("target");

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

    // ───────── REMEMBER ─────────
    if (interaction.commandName === "remember") {
      const target = interaction.options.getUser("target");

      data.memory += 2;

      return interaction.reply({
        embeds: [
          makeEmbed(
            pick([
              `🕯️ A memory of ${target} returns.`,
              `🌙 Time refuses to erase ${target}.`,
              `🌫️ You remember ${target} too clearly.`
            ])
          )
        ],
        allowedMentions: { users: [target.id] }
      });
    }

    // ───────── YEARN ─────────
    if (interaction.commandName === "yearn") {
      const target = interaction.options.getUser("target");

      data.obsession += 2;
      data.longing += 1;

      return interaction.reply({
        embeds: [
          makeEmbed(
            pick([
              `🌫️ You yearn for ${target}.`,
              `🕯️ Something about ${target} lingers.`,
              `🌙 You reach for ${target}, but nothing answers.`,
              `🖤 Yearning becomes heavier each time.`,
              `🌫️ ${target} exists in your unspoken thoughts.`
            ])
          )
        ],
        allowedMentions: { users: [target.id] }
      });
    }

    // ───────── WATCH ─────────
    if (interaction.commandName === "watch") {
      const target = interaction.options.getUser("target");

      return interaction.reply({
        embeds: [
          makeEmbed(
            pick([
              `👁️ You watch ${target}.`,
              `🌫️ ${target} is observed silently.`,
              `🕯️ No interaction occurs.`
            ])
          )
        ],
        allowedMentions: { users: [target.id] }
      });
    }

    // ───────── FADE ─────────
    if (interaction.commandName === "fade") {
      const target = interaction.options.getUser("target");

      data.distance += 2;

      return interaction.reply({
        embeds: [
          makeEmbed(
            pick([
              `🌫️ Connection with ${target} fades.`,
              `🕯️ Distance grows between you.`,
              `🌙 ${target} slips further away.`
            ])
          )
        ],
        allowedMentions: { users: [target.id] }
      });
    }

    // ───────── IGNORE ─────────
    if (interaction.commandName === "ignore") {
      const target = interaction.options.getUser("target");

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

    // ───────── ACCUSE ─────────
    if (interaction.commandName === "accuse") {
      const target = interaction.options.getUser("target");

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

    // ───────── BETRAY ─────────
    if (interaction.commandName === "betray") {
      const target = interaction.options.getUser("target");

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

    // ───────── PROFILE ─────────
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

    // ───────── HELP ─────────
    if (interaction.commandName === "help") {
      return interaction.reply({
        embeds: [
          makeEmbed(`
🌙 Lunar Consort Commands

💔 /miss /remember /yearn
🌫️ /fade /ignore
👁️ /watch
🖤 /accuse /betray
📖 /profile /help
          `)
        ]
      });
    }

  } catch (err) {
    console.error(err);

    if (!interaction.replied) {
      interaction.reply("🌙 Something went wrong in the lunar system.");
    }
  }
});

// 🚀 LOGIN
client.login(process.env.DISCORD_TOKEN);
