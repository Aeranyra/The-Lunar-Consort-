require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");

// CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// MEMORY
const memory = new Map();

// COOLDOWNS: Map of userId -> { cmdName: timestamp }
const cooldowns = new Map();

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
    });
  }
  return memory.get(id);
}

// COOLDOWN CHECK (10 seconds)
function checkCooldown(userId, cmd) {
  if (!cooldowns.has(userId)) cooldowns.set(userId, {});
  const userCds = cooldowns.get(userId);
  const now = Date.now();

  if (userCds[cmd] && now - userCds[cmd] < 10_000) {
    return true; // on cooldown
  }
  userCds[cmd] = now;
  return false;
}

// PICK RANDOM ELEMENT
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// EMBED MAKER
function makeEmbed(text) {
  return new EmbedBuilder()
    .setTitle("🌙 Lunar Consort")
    .setDescription(text)
    .setFooter({ text: "🕯️ The moon remembers everything." })
    .setTimestamp()
    .setColor("#4A4A6B");
}

// THEMED SLAP WEAPONS
const slapWeapons = [
  "a bone-handled dagger",
  "a withered rose",
  "a cold iron chain",
  "a spectral whip",
  "a shard of broken glass",
  "a rusted skeleton key",
  "a faded lace glove",
];

// RANDOM REPLIES
const replies = {
  miss: [
    "🌙 You miss {mention}. Silence grows heavier.",
    "🌫️ {mention} lingers in your thoughts.",
    "🕯️ Missing {mention} refuses to fade.",
  ],
  remember: [
    "🕯️ You remember {mention}.",
    "🌙 Memory of {mention} returns.",
    "🌫️ Time refuses to erase {mention}.",
  ],
  yearn: [
    "🌫️ You yearn for {mention}.",
    "🕯️ Something about {mention} stays.",
    "🌙 You reach for {mention}, but nothing answers.",
  ],
  watch: [
    "👁️ You watch {mention} silently.",
    "🌫️ {mention} moves unaware of your gaze.",
  ],
  fade: [
    "🌫️ {mention} slowly fades away.",
    "🕯️ Distance grows between you and {mention}.",
  ],
  ignore: ["🖤 You ignore {mention}.", "🌫️ Silence replaces response."],
  accuse: [
    "🕯️ You accuse {mention}.",
    "🌫️ Tension rises between you and {mention}.",
  ],
  betray: [
    "🖤 You betray {mention}. Something breaks.",
    "🌫️ Trust collapses quietly between you and {mention}.",
  ],
  slap: [
    "{author} strikes {mention} with {weapon}, shadows whisper in the moonlight.",
    "🌙 {author} delivers a mournful blow to {mention} using {weapon}.",
    "🖤 {weapon} finds its mark on {mention} as {author} gestures from the gloom.",
  ],
  echo: ["🕯️ An echo remains.", "🌫️ Something repeats itself in silence."],
  confess: [
    "🕯️ You confess to {mention}.",
    "🌙 Truth leaves your mouth quietly, reaching {mention}.",
  ],
  expose: ["🌫️ You expose {mention}.", "🕯️ Secrets do not stay buried, {mention}."],
  resent: [
    "🌑 You resent {mention}.",
    "🕯️ Quiet bitterness grows toward {mention}.",
  ],
  linger: [
    "🌫️ {mention} lingers in your mind.",
    "🌙 Thoughts of {mention} refuse to leave.",
  ],
};

// FORTUNE MESSAGES
const fortunes = [
  "🌙 Shadows dance in your path; beware what hides unseen.",
  "🕯️ The moon’s whisper foretells secrets soon unbound.",
  "🌫️ Tides of fate swell; the night holds both hope and sorrow.",
  "🖤 The veil thins tonight; tread carefully in dreams.",
  "🌑 Darkness shelters truths yet untold.",
];

// GET REPLY WITH REPLACEMENTS
function getReply(type, author, target) {
  let mention = target ? target.toString() : null;
  let weapon = type === "slap" ? pick(slapWeapons) : null;
  const authorMention = author.toString();

  const list = replies[type] || ["🌙 Silence answers instead."];
  let text = pick(list);

  text = text.replaceAll("{mention}", mention || "someone");
  text = text.replaceAll("{author}", authorMention);
  text = text.replaceAll("{weapon}", weapon || "");

  return text;
}

// COMMAND LIST
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
  "help",
  "fortune",
  "reset",
].map((name) => {
  const builder = new SlashCommandBuilder()
    .setName(name)
    .setDescription(`Lunar command: ${name}`);

  if (
    ![
      "profile",
      "help",
      "slap",
      "echo",
      "fortune",
      "reset",
    ].includes(name)
  ) {
    builder.addUserOption((opt) =>
      opt.setName("target").setDescription("Target user").setRequired(true)
    );
  }

  // For profile, allow optional user
  if (name === "profile") {
    builder.addUserOption((opt) =>
      opt.setName("user").setDescription("User to view profile (optional)").setRequired(false)
    );
  }
  return builder.toJSON();
});

// REST & REGISTER COMMANDS
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log("🌙 Clearing and registering commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] }
    );
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Commands registered successfully.");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
}

// READY
client.once("ready", () => {
  console.log(`🌙 Lunar Consort ONLINE as ${client.user.tag}`);
});

// INTERACTION HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  try {
    // Check cooldown:
    if (checkCooldown(user.id, commandName)) {
      return interaction.reply({
        content: "🌙 The moon needs a moment to breathe… Try again later.",
        ephemeral: true,
      });
    }

    let data;
    let targetUser;

    // Handle commands
    switch (commandName) {
      case "miss":
      case "remember":
      case "yearn":
      case "watch":
      case "fade":
      case "ignore":
      case "accuse":
      case "betray":
      case "confess":
      case "expose":
      case "resent":
      case "linger":
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return interaction.reply({
            content: "🌙 This command needs a target.",
            ephemeral: true,
          });
        }
        data = getUser(user.id);

        // Stat mapping
        const statMap = {
          miss: "longing",
          remember: "memory",
          yearn: "obsession",
          fade: "distance",
          ignore: "silence",
          accuse: "tension",
          betray: "betrayal",
        };
        if (statMap[commandName]) data[statMap[commandName]]++;

        return interaction.reply({
          content: targetUser.toString(),
          embeds: [makeEmbed(getReply(commandName, user, targetUser))],
          allowedMentions: { users: [targetUser.id] },
        });

      case "slap":
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return interaction.reply({
            content: "🌙 /slap requires a target user.",
            ephemeral: true,
          });
        }
        return interaction.reply({
          content: targetUser.toString(),
          embeds: [makeEmbed(getReply("slap", user, targetUser))],
          allowedMentions: { users: [targetUser.id] },
        });

      case "echo":
        return interaction.reply({
          embeds: [makeEmbed(getReply("echo", user, null))],
        });

      case "profile":
        targetUser = interaction.options.getUser("user") || user;
        data = getUser(targetUser.id);
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`🌙 Lunar Profile: ${targetUser.username}`)
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
              .setColor("#4A4A6B"),
          ],
        });

      case "help":
        return interaction.reply({
          embeds: [
            makeEmbed(
`🌙 **Lunar Consort Help** — A dark tale told under moonlight.

**Commands (mention a target with @user unless noted):**

• /miss @user — Express longing for another.
• /remember @user — Recall old memories.
• /yearn @user — Deep desire that clings.
• /watch @user — Silent observation.
• /fade @user — The growing distance.
• /ignore @user — Replace words with silence.
• /accuse @user — Tension rises.
• /betray @user — Trust shatters.
• /slap @user — Strike with gothic weapon.
• /echo — A haunting whisper (no target).
• /confess @user — Speak hidden truths.
• /expose @user — Secrets unveiled.
• /resent @user — Quiet bitterness.
• /linger @user — Thoughts that refuse to leave.
• /profile [user] — View your or others’ lunar stats.
• /fortune — Seek the moon’s dark prophecy.
• /reset — Clear your lunar profile.

🌙 Most commands require mentioning a user.`
            ),
          ],
        });

      case "fortune":
        return interaction.reply({
          embeds: [makeEmbed(pick(fortunes))],
        });

      case "reset":
        data = getUser(user.id);
        Object.keys(data).forEach((key) => (data[key] = 0));
        return interaction.reply({
          content: "🌙 Your lunar profile has been reset to nothingness.",
          ephemeral: true,
        });

      default:
        return interaction.reply({
          content: "🌙 Unknown command...",
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      interaction.reply({
        content: "🌙 The system flickered… try again.",
        ephemeral: true,
      });
    }
  }
});

// REGISTER AND LOGIN
registerCommands().then(() => {
  client.login(process.env.DISCORD_TOKEN);
});
