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
  const cyclePosition =
    ((daysSince % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const index = Math.floor((cyclePosition / SYNODIC_MONTH_DAYS) * 8 + 0.5) % 8;
  return MOON_PHASES[index];
}

function moonFooter() {
  const phase = getMoonPhase();
  return `${phase.emoji} ${phase.name} • The moon remembers everything.`;
}

module.exports = { getMoonPhase, moonFooter };
