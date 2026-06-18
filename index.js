require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
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
      tension: 0,
      betrayal: 0
    });
  }
  return memory.get(id);
}

// 🎲 RANDOM
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🌙 EMBED — now accepts optional mention string
function makeEmbed(text) {
  return new EmbedBuilder()
    .setTitle("🌙 Lunar Consort")
    .setDescription(text)
    .setFooter({ text: "🕯️ The moon remembers everything." })
    .setTimestamp();
}

// 🌫️ RANDOM REPLIES
const replies = {
  miss: [
    "🌙 You miss {mention}. Silence grows heavier.",
    "🌫️ {mention} lingers in your thoughts.",
    "🕯️ Missing {mention} refuses to fade."
  ],
  remember: [
    "🕯️ You remember {mention}.",
    "🌙 Memory of {mention} returns.",
    "🌫️ Time refuses to erase {mention}."
  ],
  yearn: [
    "🌫️ You yearn for {mention}.",
    "🕯️ Something about {mention} stays.",
    "🌙 You reach for {mention}, but nothing answers."
  ],
  watch: [
    "👁️ You watch {mention} silently.",
    "🌫️ {mention} moves unaware of your gaze."
  ],
  fade: [
    "🌫️ {mention} slowly fades away.",
    "🕯️ Distance grows between you and {mention}."
  ],
  ignore: [
    "🖤 You ignore {mention}.",
    "🌫️ Silence replaces response."
  ],
  accuse: [
    "🕯️ You accuse {mention}.",
    "🌫️ Tension rises between you and {mention}."
  ],
  betray: [
    "🖤 You betray {mention}. Something breaks.",
    "🌫️ Trust collapses quietly between you and {mention}."
  ],
  slap: [
    "✋ A symbolic strike echoes.",
    "🌙 Impact without meaning."
  ],
  echo: [
    "🕯️ An echo remains.",
    "🌫️ Something repeats itself in silence."
  ],
  confess: [
    "🕯️ You confess to {mention}.",
    "🌙 Truth leaves your mouth quietly, reaching {mention}."
  ],
  expose: [
    "🌫️ You expose {mention}.",
    "🕯️ Secrets do not stay buried, {mention}."
  ],
  resent: [
    "🌑 You resent {mention}.",
    "🕯️ Quiet bitterness grows toward {mention}."
  ],
  linger: [
    "🌫️ {mention} lingers in your mind.",
    "🌙 Thoughts of {mention} refuse to leave."
  ]
};

// ✅ FIX: use target.toString() for a real Discord mention (<@USER_ID>)
function getReply(type, target) {
  const mention = target ? target.toString() : "someone";
  const list = replies[type] || ["🌙 Silence answers instead."];
  return pick(list).replaceAll("{mention}", mention);
}

// 📜 COMMANDS (16)
const commands = [
  "miss",
  "remember",
  "yearn",
  "watch",
  "fade",
  "ignore",
  "accuse",
  "betray",
  "slap",
  "echo",
  "confess",
  "expose",
  "resent",
  "linger",
  "profile",
  "help"
].map(name => {
  const builder = new SlashCommandBuilder()
    .setName(name)
    .setDescription(`Lunar command: ${name}`);

  // Only add user option for commands that need a target
  if (!["profile", "help", "slap", "echo"].includes(name)) {
    builder.addUserOption(opt =>
      opt.setName("target").setDescription("Target user").setRequired(true)
    );
  }

  return builder.toJSON();
});

// 🔗 REGISTER
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log("🌙 Registering commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("✅ Commands registered successfully.");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
}

// 🌙 READY
client.once("ready", () => {
  console.log(`🌙 Lunar Consort ONLINE as ${client.user.tag}`);
});

// 🎭 HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const data = getUser(interaction.user.id);
    const cmd = interaction.commandName;
    const target = interaction.options.getUser("target") ?? null;

    const needsTarget = [
      "miss", "remember", "yearn", "watch", "fade", "ignore",
      "accuse", "betray", "confess", "expose", "resent", "linger"
    ];

    if (needsTarget.includes(cmd) && !target) {
      return interaction.reply({
        content: "🌙 This command needs a target.",
        ephemeral: true
      });
    }

    // 💔 STAT COMMANDS
    const statMap = {
      miss:     "longing",
      remember: "memory",
      yearn:    "obsession",
      fade:     "distance",
      ignore:   "silence",
      accuse:   "tension",
      betray:   "betrayal"
    };

    if (statMap[cmd]) data[statMap[cmd]]++;

    // Commands that ping a target
    if (needsTarget.includes(cmd)) {
      return interaction.reply({
        // ✅ FIX: content field adds a real ping outside the embed
        content: target.toString(),
        embeds: [makeEmbed(getReply(cmd, target))],
        allowedMentions: { users: [target.id] }
      });
    }

    if (cmd === "slap" || cmd === "echo") {
      return interaction.reply({
        embeds: [makeEmbed(getReply(cmd, null))]
      });
    }

    // 📖 PROFILE
    if (cmd === "profile") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🌙 Your Lunar Profile")
            .setDescription(
`Longing: **${data.longing}**
Memory: **${data.memory}**
Distance: **${data.distance}**
Silence: **${data.silence}**
Echo: **${data.echo}**
Obsession: **${data.obsession}**
Tension: **${data.tension}**
Betrayal: **${data.betrayal}**`
            )
            .setFooter({ text: "🕯️ The moon remembers everything." })
            .setTimestamp()
        ]
      });
    }

    // 📜 HELP
    if (cmd === "help") {
      return interaction.reply({
        embeds: [makeEmbed(
`🌙 **Commands:**
\`/miss\` \`/remember\` \`/yearn\` \`/watch\`
\`/fade\` \`/ignore\` \`/accuse\` \`/betray\`
\`/slap\` \`/echo\` \`/confess\` \`/expose\`
\`/resent\` \`/linger\` \`/profile\` \`/help\``
        )]
      });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply({ content: "🌙 The system flickered… try again.", ephemeral: true });
    }
  }
});

// 🚀 REGISTER THEN LOGIN
registerCommands().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
