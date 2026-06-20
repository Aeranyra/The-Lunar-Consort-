require("dotenv").config();
const fs = require("fs");
const path = require("path");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");

// ENV VALIDATION
const REQUIRED_ENV = ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `❌ Missing required environment variable(s): ${missingEnv.join(", ")}`
  );
  process.exit(1);
}

// CLIENT
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// MEMORY
const memory = new Map();

// PERSISTENCE — plain JSON file, no extra dependencies
const DATA_FILE = path.join(__dirname, "data.json");

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([id, stats]) => memory.set(id, stats));
    console.log(`🌙 Loaded lunar memory for ${memory.size} soul(s) from data.json.`);
  } catch (err) {
    console.error("❌ Failed to load data.json (starting with empty memory):", err);
  }
}

function saveData() {
  try {
    const obj = Object.fromEntries(memory);
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Failed to save data.json:", err);
  }
}

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

// Increments a stat and persists the change. Returns the updated user data.
function incrementStat(userId, statKey) {
  const data = getUser(userId);
  data[statKey]++;
  saveData();
  return data;
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

// MOON PHASE ENGINE — computes the real current phase, used in every embed footer
const MOON_PHASES = [
  { name: "New Moon", emoji: "🌑" },
  { name: "Waxing Crescent", emoji: "🌒" },
  { name: "First Quarter", emoji: "🌓" },
  { name: "Waxing Gibbous", emoji: "🌔" },
  { name: "Full Moon", emoji: "🌕" },
  { name: "Waning Gibbous", emoji: "🌖" },
  { name: "Last Quarter", emoji: "🌗" },
  { name: "Waning Crescent", emoji: "🌘" },
];
const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

function getMoonPhase() {
  const daysSince = (Date.now() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const cyclePosition = ((daysSince % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const index = Math.floor((cyclePosition / SYNODIC_MONTH_DAYS) * 8 + 0.5) % 8;
  return MOON_PHASES[index];
}

function moonFooter() {
  const phase = getMoonPhase();
  return `${phase.emoji} ${phase.name} • The moon remembers everything.`;
}

// EMBED MAKER
function makeEmbed(text) {
  return new EmbedBuilder()
    .setTitle("🌙 Lunar Consort")
    .setDescription(text)
    .setFooter({ text: moonFooter() })
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

// THEMED KILL WEAPONS (distinct pool from /slap, more dramatic/final)
const killWeapons = [
  "a moonlit guillotine",
  "a phantom's noose",
  "a cursed dagger forged in starlight",
  "a void-black scythe",
  "a goblet of poisoned wine",
  "a shattered hourglass",
  "a wraith's icy embrace",
  "a coffin lid slammed shut",
  "the last toll of a graveyard bell",
];

// MAP COMMAND TYPE -> WEAPON POOL (extend here for future weapon-based commands)
const weaponPools = {
  slap: slapWeapons,
  kill: killWeapons,
};

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
  kill: [
    "🖤 {author} ends {mention} with {weapon}, and the moon looks away.",
    "🌑 Under a dying moon, {author} claims {mention} with {weapon}.",
    "🕯️ {weapon} seals {mention}'s fate as {author} watches in silence.",
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
  haunt: [
    "👻 You haunt {mention}, a chill no one else feels.",
    "🌫️ {mention} senses eyes that aren't there — yours.",
    "🕯️ You linger in {mention}'s reflection, just out of sight.",
  ],
  curse: [
    "🌑 You curse {mention} under your breath, and the candles flicker.",
    "🖤 A quiet curse leaves your lips, settling over {mention}.",
    "🕯️ {mention} feels something shift — your curse has taken root.",
  ],
  worship: [
    "🌙 You worship {mention} as though they were the moon itself.",
    "🕯️ Every thought bends toward {mention}, reverent and quiet.",
    "🌫️ {mention} becomes the altar you kneel before.",
  ],
};

// ACTION TYPES ELIGIBLE FOR /random (anything with a target; echo is excluded since it has none)
const randomActionTypes = Object.keys(replies).filter((type) => type !== "echo");

// STAT MAPPING — shared by the direct commands and by /random
const statMap = {
  miss: "longing",
  remember: "memory",
  yearn: "obsession",
  fade: "distance",
  ignore: "silence",
  accuse: "tension",
  betray: "betrayal",
};

// LUNAR TITLES — based on a user's combined stat total, shown on /profile
const MOON_TITLES = [
  { min: 100, title: "Sovereign of the Veil" },
  { min: 50, title: "Eternal Consort" },
  { min: 25, title: "Moonlit Devotee" },
  { min: 10, title: "Bound Spirit" },
  { min: 1, title: "Wandering Shade" },
  { min: 0, title: "Unawakened Soul" },
];

function getMoonTitle(total) {
  return MOON_TITLES.find((tier) => total >= tier.min).title;
}

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
  let weapon = weaponPools[type] ? pick(weaponPools[type]) : null;
  const authorMention = author.toString();

  const list = replies[type] || ["🌙 Silence answers instead."];
  let text = pick(list);

  text = text.replaceAll("{mention}", mention || "someone");
  text = text.replaceAll("{author}", authorMention);
  text = text.replaceAll("{weapon}", weapon || "");

  return text;
}

// COMMAND DESCRIPTIONS (shown in Discord's slash command UI)
const commandDescriptions = {
  miss: "Express longing for another.",
  remember: "Recall old memories.",
  yearn: "Deep desire that clings.",
  watch: "Silent observation.",
  fade: "The growing distance.",
  ignore: "Replace words with silence.",
  accuse: "Tension rises.",
  betray: "Trust shatters.",
  slap: "Strike someone with a gothic weapon.",
  kill: "End someone with a gothic weapon, dramatically.",
  random: "Let the moon choose your fate with someone at random.",
  echo: "A haunting whisper.",
  confess: "Speak hidden truths.",
  expose: "Secrets unveiled.",
  resent: "Quiet bitterness.",
  linger: "Thoughts that refuse to leave.",
  haunt: "Linger unseen at someone's side.",
  curse: "Whisper a quiet curse upon them.",
  worship: "Devote yourself to someone, reverently.",
  profile: "View your or others' lunar stats.",
  help: "Show the Lunar Consort command guide.",
  fortune: "Seek the moon's dark prophecy.",
  reset: "Clear your lunar profile.",
  top: "View the Hall of the Moonbound — top lunar scores.",
};

// COMMANDS THAT DO NOT REQUIRE A TARGET USER
const noTargetCommands = ["profile", "help", "echo", "fortune", "reset", "top"];

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
  "kill",
  "random",
  "echo",
  "confess",
  "expose",
  "resent",
  "linger",
  "haunt",
  "curse",
  "worship",
  "profile",
  "help",
  "fortune",
  "reset",
  "top",
].map((name) => {
  const builder = new SlashCommandBuilder()
    .setName(name)
    .setDescription(commandDescriptions[name] || `Lunar command: ${name}`);

  if (!noTargetCommands.includes(name)) {
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

  // For top, allow choosing which stat to rank by
  if (name === "top") {
    builder.addStringOption((opt) =>
      opt
        .setName("stat")
        .setDescription("Which stat to rank by (default: total)")
        .setRequired(false)
        .addChoices(
          { name: "Total (all stats combined)", value: "total" },
          { name: "Longing", value: "longing" },
          { name: "Memory", value: "memory" },
          { name: "Distance", value: "distance" },
          { name: "Silence", value: "silence" },
          { name: "Echo", value: "echo" },
          { name: "Obsession", value: "obsession" },
          { name: "Tension", value: "tension" },
          { name: "Betrayal", value: "betrayal" }
        )
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
    throw err;
  }
}

// READY
client.once("clientReady", () => {
  console.log(`🌙 Lunar Consort ONLINE as ${client.user.tag}`);
});

// SAFE REPLY HELPER — avoids unhandled rejections on fallback errors
function safeReply(interaction, payload) {
  if (interaction.deferred) {
    return interaction.editReply(payload).catch((err) => {
      console.error("Failed to editReply:", err);
    });
  }
  if (!interaction.replied) {
    return interaction.reply(payload).catch((err) => {
      console.error("Failed to reply:", err);
    });
  }
  return interaction.followUp(payload).catch((err) => {
    console.error("Failed to followUp:", err);
  });
}

// INTERACTION HANDLER
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  try {
    // Check cooldown:
    if (checkCooldown(user.id, commandName)) {
      return safeReply(interaction, {
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
      case "haunt":
      case "curse":
      case "worship":
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return safeReply(interaction, {
            content: "🌙 This command needs a target.",
            ephemeral: true,
          });
        }
        data = getUser(user.id);
        if (statMap[commandName]) {
          data = incrementStat(user.id, statMap[commandName]);
        }

        return safeReply(interaction, {
          content: targetUser.toString(),
          embeds: [makeEmbed(getReply(commandName, user, targetUser))],
          allowedMentions: { users: [targetUser.id] },
        });

      case "slap":
      case "kill":
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return safeReply(interaction, {
            content: `🌙 /${commandName} requires a target user.`,
            ephemeral: true,
          });
        }
        return safeReply(interaction, {
          content: targetUser.toString(),
          embeds: [makeEmbed(getReply(commandName, user, targetUser))],
          allowedMentions: { users: [targetUser.id] },
        });

      case "random": {
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return safeReply(interaction, {
            content: "🌙 /random requires a target user.",
            ephemeral: true,
          });
        }
        const chosenType = pick(randomActionTypes);
        if (statMap[chosenType]) {
          data = incrementStat(user.id, statMap[chosenType]);
        }
        return safeReply(interaction, {
          content: targetUser.toString(),
          embeds: [makeEmbed(getReply(chosenType, user, targetUser))],
          allowedMentions: { users: [targetUser.id] },
        });
      }

      case "top": {
        const statChoice = interaction.options.getString("stat") || "total";
        const entries = Array.from(memory.entries())
          .map(([id, stats]) => ({
            id,
            value:
              statChoice === "total"
                ? Object.values(stats).reduce((sum, n) => sum + n, 0)
                : stats[statChoice] ?? 0,
          }))
          .filter((entry) => entry.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        if (entries.length === 0) {
          return safeReply(interaction, {
            embeds: [makeEmbed("🌑 The moon has nothing to show. No tales have been written yet.")],
          });
        }

        const rankEmojis = ["🥇", "🥈", "🥉"];
        const lines = entries.map((entry, i) => {
          const rankLabel = rankEmojis[i] || `**${i + 1}.**`;
          return `${rankLabel} <@${entry.id}> — **${entry.value}**`;
        });

        const statLabel =
          statChoice === "total"
            ? "Total Lunar Score"
            : statChoice.charAt(0).toUpperCase() + statChoice.slice(1);

        return safeReply(interaction, {
          embeds: [
            new EmbedBuilder()
              .setTitle(`🌙 Hall of the Moonbound — ${statLabel}`)
              .setDescription(lines.join("\n"))
              .setFooter({ text: moonFooter() })
              .setTimestamp()
              .setColor("#4A4A6B"),
          ],
        });
      }

      case "echo":
        return safeReply(interaction, {
          embeds: [makeEmbed(getReply("echo", user, null))],
        });

      case "profile":
        targetUser = interaction.options.getUser("user") || user;
        data = getUser(targetUser.id);
        const total = Object.values(data).reduce((sum, n) => sum + n, 0);
        return safeReply(interaction, {
          embeds: [
            new EmbedBuilder()
              .setTitle(`🌙 Lunar Profile: ${targetUser.username}`)
              .setDescription(
`Title: **${getMoonTitle(total)}**

Longing: **${data.longing}**
Memory: **${data.memory}**
Distance: **${data.distance}**
Silence: **${data.silence}**
Echo: **${data.echo}**
Obsession: **${data.obsession}**
Tension: **${data.tension}**
Betrayal: **${data.betrayal}**`
              )
              .setFooter({ text: moonFooter() })
              .setTimestamp()
              .setColor("#4A4A6B"),
          ],
        });

      case "help":
        return safeReply(interaction, {
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
• /kill @user — End someone with a gothic weapon, dramatically.
• /random @user — Let the moon choose your fate with them at random.
• /echo — A haunting whisper (no target).
• /confess @user — Speak hidden truths.
• /expose @user — Secrets unveiled.
• /resent @user — Quiet bitterness.
• /linger @user — Thoughts that refuse to leave.
• /haunt @user — Linger unseen at someone's side.
• /curse @user — Whisper a quiet curse upon them.
• /worship @user — Devote yourself to someone, reverently.
• /profile [user] — View your or others’ lunar stats and title.
• /fortune — Seek the moon’s dark prophecy.
• /reset — Clear your lunar profile.
• /top [stat] — View the Hall of the Moonbound leaderboard.

🌙 Most commands require mentioning a user.`
            ),
          ],
        });

      case "fortune":
        return safeReply(interaction, {
          embeds: [makeEmbed(pick(fortunes))],
        });

      case "reset":
        data = getUser(user.id);
        Object.keys(data).forEach((key) => (data[key] = 0));
        saveData();
        return safeReply(interaction, {
          content: "🌙 Your lunar profile has been reset to nothingness.",
          ephemeral: true,
        });

      default:
        return safeReply(interaction, {
          content: "🌙 Unknown command...",
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error(error);
    safeReply(interaction, {
      content: "🌙 The system flickered… try again.",
      ephemeral: true,
    });
  }
});

// REGISTER AND LOGIN
loadData();

registerCommands()
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
