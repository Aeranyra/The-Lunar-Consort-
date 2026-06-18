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
      tension: 0,
      betrayal: 0,
      trust: 0
    });
  }
  return memory.get(id);
}

// 🎲 RANDOM PICK
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🌙 EMBED
function makeEmbed(text) {
  return new EmbedBuilder()
    .setTitle("🌙 Lunar Consort")
    .setDescription(text)
    .setFooter({ text: "🕯️ The moon remembers everything." })
    .setTimestamp();
}

// 🌫️ RANDOM REPLIES (16 COMMANDS SUPPORT)
const replies = {
  miss: [
    "🌙 You miss {target}. Silence grows heavier.",
    "🌫️ {target} lingers in your thoughts.",
    "🕯️ Missing {target} refuses to fade."
  ],

  remember: [
    "🕯️ You remember {target}.",
    "🌙 Memory of {target} returns.",
    "🌫️ Time refuses to erase {target}."
  ],

  yearn: [
    "🌫️ You yearn for {target}.",
    "🕯️ Something about {target} stays.",
    "🌙 You reach for {target}, but nothing answers."
  ],

  watch: [
    "👁️ You watch {target} silently.",
    "🌫️ {target} moves unaware of your gaze."
  ],

  fade: [
    "🌫️ {target} slowly fades away.",
    "🕯️ Distance grows between you and {target}."
  ],

  ignore: [
    "🖤 You ignore {target}.",
    "🌫️ Silence replaces response."
  ],

  accuse: [
    "🕯️ You accuse {target}.",
    "🌫️ Tension rises between you."
  ],

  betray: [
    "🖤 You betray {target}. Something breaks.",
    "🌫️ Trust collapses quietly."
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
    "🕯️ You confess to {target}.",
    "🌙 Truth leaves your mouth quietly."
  ],

  expose: [
    "🌫️ You expose {target}.",
    "🕯️ Secrets do not stay buried."
  ],

  resent: [
    "🌑 You resent {target}.",
    "🕯️ Quiet bitterness grows."
  ],

  linger: [
    "🌫️ {target} lingers in your mind.",
    "🌙 Thoughts refuse to leave."
  ]
};

function getReply(type, target) {
  return pick(replies[type]).replaceAll("{target}", target);
}

// 📜 COMMAND LIST (16 COMMANDS)
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
].map(name =>
  new SlashCommandBuilder()
    .setName(name)
    .setDescription(`Lunar command: ${name}`)
    .addUserOption(opt =>
      ["profile", "help"].includes(name)
        ? opt
        : opt.setName("target").setDescription("Target user").setRequired(true)
    )
    .toJSON()
);

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

// 🌙 READY EVENT
client.once("ready", async () => {
  console.log("🌙 Lunar Consort ONLINE");
  await registerCommands();
});

// 🎭 COMMAND HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const data = getUser(interaction.user.id);
    const cmd = interaction.commandName;
    const target = interaction.options.getUser("target");

    // 💔 MISS
    if (cmd === "miss") {
      data.longing++;
      return interaction.reply({ embeds: [makeEmbed(getReply("miss", target))], allowedMentions: { users: [target.id] } });
    }

    // 🕯 REMEMBER
    if (cmd === "remember") {
      data.memory++;
      return interaction.reply({ embeds: [makeEmbed(getReply("remember", target))], allowedMentions: { users: [target.id] } });
    }

    // 🌫 YEARN
    if (cmd === "yearn") {
      data.obsession++;
      return interaction.reply({ embeds: [makeEmbed(getReply("yearn", target))], allowedMentions: { users: [target.id] } });
    }

    // 👁 WATCH
    if (cmd === "watch") {
      return interaction.reply({ embeds: [makeEmbed(getReply("watch", target))], allowedMentions: { users: [target.id] } });
    }

    // 🌫 FADE
    if (cmd === "fade") {
      data.distance++;
      return interaction.reply({ embeds: [makeEmbed(getReply("fade", target))], allowedMentions: { users: [target.id] } });
    }

    // 🖤 IGNORE
    if (cmd === "ignore") {
      data.silence++;
      return interaction.reply({ embeds: [makeEmbed(getReply("ignore", target))], allowedMentions: { users: [target.id] } });
    }

    // 🕯 ACCUSE
    if (cmd === "accuse") {
      data.tension++;
      return interaction.reply({ embeds: [makeEmbed(getReply("accuse", target))], allowedMentions: { users: [target.id] } });
    }

    // 🖤 BETRAY
    if (cmd === "betray") {
      data.betrayal++;
      return interaction.reply({ embeds: [makeEmbed(getReply("betray", target))], allowedMentions: { users: [target.id] } });
    }

    // ✋ SLAP
    if (cmd === "slap") {
      return interaction.reply({ embeds: [makeEmbed(getReply("slap", target))] });
    }

    // 🕯 ECHO
    if (cmd === "echo") {
      return interaction.reply({ embeds: [makeEmbed(getReply("echo", target))] });
    }

    // 🕯 CONFESS
    if (cmd === "confess") {
      return interaction.reply({ embeds: [makeEmbed(getReply("confess", target))], allowedMentions: { users: [target.id] } });
    }

    // 🌫 EXPOSE
    if (cmd === "expose") {
      return interaction.reply({ embeds: [makeEmbed(getReply("expose", target))], allowedMentions: { users: [target.id] } });
    }

    // 🌑 RESENT
    if (cmd === "resent") {
      return interaction.reply({ embeds: [makeEmbed(getReply("resent", target))], allowedMentions: { users: [target.id] } });
    }

    // 🌫 LINGER
    if (cmd === "linger") {
      return interaction.reply({ embeds: [makeEmbed(getReply("linger", target))], allowedMentions: { users: [target.id] } });
    }

    // 📖 PROFILE
    if (cmd === "profile") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🌙 Profile")
            .setDescription(
`Longing: ${data.longing}
Memory: ${data.memory}
Distance: ${data.distance}
Silence: ${data.silence}
Echo: ${data.echo}
Obsession: ${data.obsession}
Betrayal: ${data.betrayal}`
            )
        ]
      });
    }

    // 📜 HELP
    if (cmd === "help") {
      return interaction.reply({
        embeds: [makeEmbed(
`🌙 Commands:
/miss /remember /yearn /watch
/fade /ignore /accuse /betray
/slap /echo /confess /expose
/resent /linger /profile /help`
        )]
      });
    }

  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      interaction.reply("🌙 The system flickered… try again.");
    }
  }
});

// 🚀 LOGIN
client.login(process.env.DISCORD_TOKEN);
