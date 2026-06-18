const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🌙 MEMORY SYSTEM
const memory = new Map();

// 🧠 Get user state
function getUser(id) {
  if (!memory.has(id)) {
    memory.set(id, {
      affection: 0,
      distance: 0,
      longing: 0,
      silence: 0,
      echo: 0,
      last: Date.now()
    });
  }
  return memory.get(id);
}

// 🎲 RANDOM PICKER
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🌫️ PASSIVE DRIFT SYSTEM
setInterval(() => {
  for (const data of memory.values()) {
    const time = Date.now() - data.last;

    if (time > 60000) {
      data.distance += 1;
      data.silence += 1;
      data.echo += 1;

      data.affection = Math.max(0, data.affection - 1);
    }
  }
}, 30000);
e.content);
client.once("ready", () => {
  console.log("🌙 Lunar Consort Emotional Engine ONLINE");
});
client.on("messageCreate", (message) => {
  console.log("📩 MESSAGE DETECTED:", messag
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const data = getUser(message.author.id);
  data.last = Date.now();

  // 🌙 MISS
  if (message.content === "!miss") {
    data.longing += 2;
    data.distance += 1;

    const responses = [
      "🌙 Missing recorded. No reply will return.",
      "🌫️ Emotional absence has been noted.",
      "🕯️ The system registers distance.",
      "🌑 No response was found on the other side."
    ];

    return message.reply(pick(responses));
  }

  // 🕯️ ECHO
  if (message.content === "!echo") {
    data.echo += 2;

    const responses = [
      "🕯️ An echo remains. It does not speak.",
      "🌫️ Something lingers, but refuses response.",
      "🌙 Echo detected in emotional space.",
      "🪞 It repeats nothing. Yet it stays."
    ];

    return message.reply(pick(responses));
  }

  // 🌫️ DISTANCE
  if (message.content === "!distance") {
    const states = ["Close", "Drifting", "Far", "Unreachable"];
    const state = pick(states);

    return message.reply(`🌫️ Distance state: ${state}`);
  }

  // 🖤 PROFILE
  if (message.content === "!profile") {
    return message.reply(
`🌙 Lunar Consort Profile

Affection: ${data.affection}
Distance: ${data.distance}
Longing: ${data.longing}
Silence: ${data.silence}
Echo: ${data.echo}`
    );
  }

  // 🌫️ SAD
  if (message.content === "!sad") {
    data.silence += 2;

    return message.reply(
      pick([
        "🌫️ Sadness recorded without resolution.",
        "🕯️ Emotion acknowledged. No action taken.",
        "🌙 The system remains unchanged."
      ])
    );
  }

  // 🖤 SLAP
  if (message.content === "!slap") {
    data.distance += 2;

    return message.reply(
      pick([
        "🌫️ Connection briefly interrupted.",
        "🕯️ A reaction was registered.",
        "🌙 Emotional alignment shifted."
      ])
    );
  }

  // 🌙 RARE EVENT (FIXED: ONLY WHEN NOT BOT COMMANDS)
  const isCommand = message.content.startsWith("!");
  if (!isCommand && Math.random() < 0.03) {
    return message.reply("🕯️ Something remembers you longer than it should.");
  }
});

client.login(process.env.DISCORD_TOKEN);
