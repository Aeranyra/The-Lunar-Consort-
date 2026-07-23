function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const slapWeapons = [
  "a bone-handled dagger",
  "a withered rose",
  "a cold iron chain",
  "a spectral whip",
  "a shard of broken glass",
  "a rusted skeleton key",
  "a faded lace glove",
];

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

const weaponPools = {
  slap: slapWeapons,
  kill: killWeapons,
};

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

// Anything with a target is eligible for /random; echo has no target so it's excluded.
const randomActionTypes = Object.keys(replies).filter((type) => type !== "echo");

// Maps a command name to the stat it increments. Every target-based command
// (except /watch's silent-observation flavor and /echo, which has no target)
// now tracks its own stat.
const statMap = {
  miss: "longing",
  remember: "memory",
  yearn: "obsession",
  fade: "distance",
  ignore: "silence",
  accuse: "tension",
  betray: "betrayal",
  confess: "confession",
  expose: "exposure",
  resent: "resentment",
  linger: "lingering",
  haunt: "haunting",
  curse: "cursing",
  worship: "worshipping",
  watch: "watching",
};

const STAT_LABELS = {
  longing: "Longing",
  memory: "Memory",
  distance: "Distance",
  silence: "Silence",
  echo: "Echo",
  obsession: "Obsession",
  tension: "Tension",
  betrayal: "Betrayal",
  confession: "Confession",
  exposure: "Exposure",
  resentment: "Resentment",
  lingering: "Lingering",
  haunting: "Haunting",
  cursing: "Cursing",
  worshipping: "Worship",
  watching: "Watching",
};

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

const fortunes = [
  "🌙 Shadows dance in your path; beware what hides unseen.",
  "🕯️ The moon's whisper foretells secrets soon unbound.",
  "🌫️ Tides of fate swell; the night holds both hope and sorrow.",
  "🖤 The veil thins tonight; tread carefully in dreams.",
  "🌑 Darkness shelters truths yet untold.",
  "🌘 An old wound stirs; let it speak before it festers.",
  "✨ A stranger's gaze lingers longer than you think.",
  "🕸️ What you bury tonight, the moon will unearth.",
  "🩸 Loyalty is tested where shadows grow long.",
  "🪦 An ending approaches, though not the one you fear.",
  "🔮 Clarity comes only after the fog has had its say.",
  "🌗 Patience now spares regret later.",
  "🦇 Something watches from just beyond the candlelight.",
  "🖋️ A truth you've avoided will find its way to paper.",
  "🌌 The stars conspire quietly; trust what feels inevitable.",
];

// Tiered flavor text for /ship, keyed by the lowest score in the bracket.
const SHIP_TIERS = [
  { min: 90, text: "🌕 A bond written in the stars themselves — undeniable, eternal." },
  { min: 70, text: "🌔 A rare and radiant pull. The moon approves." },
  { min: 50, text: "🌓 Something real, if a little uncertain. Worth tending." },
  { min: 30, text: "🌒 A flicker of possibility, easily lost to distance." },
  { min: 0, text: "🌑 The moon sees no bond here. Only shadows." },
];

function getShipTierText(percent) {
  return SHIP_TIERS.find((tier) => percent >= tier.min).text;
}

const commandDescriptions = {
  miss: "Express longing for another.",
  remember: "Recall old memories.",
  yearn: "Deep desire that clings.",
  watch: "Silent observation.",
  fade: "The growing distance.",
  ignore: "Replace words with silence.",
  accuse: "Tension rises.",
  betray: "Trust shatters.",
  slap: "Strike someone with a random gothic weapon.",
  kill: "End someone dramatically with a random, more final weapon.",
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
  ship: "See how two souls are bound under the moon.",
};

const noTargetCommands = ["profile", "help", "echo", "fortune", "reset", "top"];

// Fills a random reply template for `type` with the author/target/weapon.
function getReply(type, author, target) {
  const mention = target ? target.toString() : null;
  const weapon = weaponPools[type] ? pick(weaponPools[type]) : null;
  const authorMention = author.toString();

  const list = replies[type] || ["🌙 Silence answers instead."];
  let text = pick(list);

  text = text.replaceAll("{mention}", mention || "someone");
  text = text.replaceAll("{author}", authorMention);
  text = text.replaceAll("{weapon}", weapon || "");

  return text;
}

module.exports = {
  pick,
  getReply,
  slapWeapons,
  killWeapons,
  weaponPools,
  replies,
  randomActionTypes,
  statMap,
  STAT_LABELS,
  MOON_TITLES,
  getMoonTitle,
  fortunes,
  getShipTierText,
  commandDescriptions,
  noTargetCommands,
};
