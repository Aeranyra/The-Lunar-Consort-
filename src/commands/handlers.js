const crypto = require("crypto");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { getUser, incrementStat, resetUser, statTotal, memory } = require("../data");
const {
  getReply,
  randomActionTypes,
  statMap,
  STAT_LABELS,
  getMoonTitle,
  fortunes,
  getShipTierText,
  slapWeapons,
  killWeapons,
  pick,
} = require("../content");
const { makeEmbed, baseEmbed } = require("../embeds");
const { checkCooldown } = require("../cooldowns");
const { validateTarget } = require("../validation");

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

// Deterministic 0-99 "compatibility" score for a pair of user IDs, stable
// regardless of who ran the command or the argument order.
function shipPercent(idA, idB) {
  const key = [idA, idB].sort().join(":");
  const hash = crypto.createHash("md5").update(key).digest("hex");
  return parseInt(hash.slice(0, 8), 16) % 100;
}

function buildProfileEmbed(targetUser, data) {
  const total = statTotal(data);
  const fields = Object.entries(STAT_LABELS).map(([key, label]) => ({
    name: label,
    value: `${data[key] ?? 0}`,
    inline: true,
  }));

  return baseEmbed()
    .setTitle(`🌙 Lunar Profile: ${targetUser.username}`)
    .setDescription(`Title: **${getMoonTitle(total)}**\nTotal: **${total}**`)
    .addFields(fields);
}

function buildTopEmbed(statChoice) {
  const entries = Array.from(memory.entries())
    .map(([id, stats]) => ({
      id,
      value: statChoice === "total" ? statTotal(stats) : stats[statChoice] ?? 0,
    }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  if (entries.length === 0) {
    return makeEmbed("🌑 The moon has nothing to show. No tales have been written yet.");
  }

  const rankEmojis = ["🥇", "🥈", "🥉"];
  const lines = entries.map((entry, i) => {
    const rankLabel = rankEmojis[i] || `**${i + 1}.**`;
    return `${rankLabel} <@${entry.id}> — **${entry.value}**`;
  });

  const statLabel = statChoice === "total" ? "Total Lunar Score" : STAT_LABELS[statChoice] || statChoice;

  return baseEmbed()
    .setTitle(`🌙 Hall of the Moonbound — ${statLabel}`)
    .setDescription(lines.join("\n"));
}

async function handleShip(interaction) {
  const userA = interaction.options.getUser("user1");
  const userB = interaction.options.getUser("user2") || interaction.user;

  if (userB.bot || userA.bot) {
    return safeReply(interaction, {
      content: "🌙 The moon does not bind bots to fate.",
      ephemeral: true,
    });
  }
  if (userA.id === userB.id) {
    return safeReply(interaction, {
      content: "🌙 A soul cannot be bound to itself.",
      ephemeral: true,
    });
  }

  const percent = shipPercent(userA.id, userB.id);
  const barLength = 10;
  const filled = Math.round((percent / 100) * barLength);
  const bar = "🖤".repeat(filled) + "🤍".repeat(barLength - filled);

  return safeReply(interaction, {
    embeds: [
      baseEmbed()
        .setTitle("🌙 A Lunar Binding")
        .setDescription(
          `${userA} × ${userB}\n\n${bar}  **${percent}%**\n\n${getShipTierText(percent)}`
        ),
    ],
  });
}

async function handleReset(interaction) {
  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("reset_confirm")
      .setLabel("Yes, erase everything")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("reset_cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary)
  );

  await interaction.reply({
    content: "🌙 Are you sure you want to erase your lunar profile? This cannot be undone.",
    components: [confirmRow],
    ephemeral: true,
  });

  try {
    const confirmation = await interaction.awaitMessageComponent({
      filter: (i) =>
        i.user.id === interaction.user.id &&
        ["reset_confirm", "reset_cancel"].includes(i.customId),
      time: 15_000,
    });

    if (confirmation.customId === "reset_confirm") {
      resetUser(interaction.user.id);
      await confirmation.update({
        content: "🌙 Your lunar profile has been reset to nothingness.",
        components: [],
      });
    } else {
      await confirmation.update({
        content: "🌙 Reset cancelled. Your tale continues.",
        components: [],
      });
    }
  } catch {
    await interaction.editReply({
      content: "🌙 No response — reset cancelled.",
      components: [],
    });
  }
}

async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  try {
    if (checkCooldown(user.id, commandName)) {
      return safeReply(interaction, {
        content: "🌙 The moon needs a moment to breathe… Try again later.",
        ephemeral: true,
      });
    }

    let data;
    let targetUser;

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
      case "worship": {
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return safeReply(interaction, {
            content: "🌙 This command needs a target.",
            ephemeral: true,
          });
        }
        const targetError = validateTarget(commandName, user.id, targetUser);
        if (targetError) {
          return safeReply(interaction, { content: targetError, ephemeral: true });
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
      }

      case "slap":
      case "kill": {
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return safeReply(interaction, {
            content: `🌙 /${commandName} requires a target user.`,
            ephemeral: true,
          });
        }
        const targetError = validateTarget(commandName, user.id, targetUser);
        if (targetError) {
          return safeReply(interaction, { content: targetError, ephemeral: true });
        }
        return safeReply(interaction, {
          content: targetUser.toString(),
          embeds: [makeEmbed(getReply(commandName, user, targetUser))],
          allowedMentions: { users: [targetUser.id] },
        });
      }

      case "random": {
        targetUser = interaction.options.getUser("target");
        if (!targetUser) {
          return safeReply(interaction, {
            content: "🌙 /random requires a target user.",
            ephemeral: true,
          });
        }
        const targetError = validateTarget(commandName, user.id, targetUser);
        if (targetError) {
          return safeReply(interaction, { content: targetError, ephemeral: true });
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

      case "ship":
        return handleShip(interaction);

      case "top": {
        const statChoice = interaction.options.getString("stat") || "total";
        return safeReply(interaction, { embeds: [buildTopEmbed(statChoice)] });
      }

      case "echo":
        return safeReply(interaction, {
          embeds: [makeEmbed(getReply("echo", user, null))],
        });

      case "profile": {
        targetUser = interaction.options.getUser("user") || user;
        data = getUser(targetUser.id);
        return safeReply(interaction, { embeds: [buildProfileEmbed(targetUser, data)] });
      }

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
• /slap @user — Strike with a random gothic weapon (${slapWeapons.length} to choose from).
• /kill @user — End someone dramatically with a random, more final weapon (${killWeapons.length} to choose from).
• /random @user — Let the moon choose your fate with them at random.
• /echo — A haunting whisper (no target).
• /confess @user — Speak hidden truths.
• /expose @user — Secrets unveiled.
• /resent @user — Quiet bitterness.
• /linger @user — Thoughts that refuse to leave.
• /haunt @user — Linger unseen at someone's side.
• /curse @user — Whisper a quiet curse upon them.
• /worship @user — Devote yourself to someone, reverently.
• /ship @user1 [@user2] — See how two souls are bound under the moon (user2 defaults to you).
• /profile [user] — View your or others' lunar stats and title.
• /fortune — Seek one of ${fortunes.length} dark prophecies the moon may offer.
• /reset — Clear your lunar profile (asks for confirmation).
• /top [stat] — View the Hall of the Moonbound leaderboard.

🌙 Most commands require mentioning a user. Bots can't be targeted — except for /slap and /kill, which can be aimed at anyone, including yourself or a bot.`
            ),
          ],
        });

      case "fortune":
        return safeReply(interaction, { embeds: [makeEmbed(pick(fortunes))] });

      case "reset":
        return handleReset(interaction);

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
}

module.exports = { handleInteraction };
