const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data.json");

// Every trackable stat a user can accumulate. Add new keys here and they
// automatically flow through /profile, /top, and default new-user creation.
const DEFAULT_STATS = {
  longing: 0,
  memory: 0,
  distance: 0,
  silence: 0,
  echo: 0,
  obsession: 0,
  tension: 0,
  betrayal: 0,
  confession: 0,
  exposure: 0,
  resentment: 0,
  lingering: 0,
  haunting: 0,
  cursing: 0,
  worshipping: 0,
  watching: 0,
};

const memory = new Map();

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return;
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([id, stats]) =>
      memory.set(id, { ...DEFAULT_STATS, ...stats })
    );
    console.log(`🌙 Loaded lunar memory for ${memory.size} soul(s) from data.json.`);
  } catch (err) {
    console.error("❌ Failed to load data.json (starting with empty memory):", err);
  }
}

// fs.writeFileSync is synchronous, so within Node's single-threaded event
// loop there's no risk of two saves interleaving mid-write.
function saveData() {
  try {
    const obj = Object.fromEntries(memory);
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Failed to save data.json:", err);
  }
}

function getUser(id) {
  if (!memory.has(id)) {
    memory.set(id, { ...DEFAULT_STATS });
  }
  return memory.get(id);
}

function incrementStat(userId, statKey) {
  const data = getUser(userId);
  if (Object.prototype.hasOwnProperty.call(data, statKey)) {
    data[statKey]++;
    saveData();
  }
  return data;
}

function resetUser(userId) {
  const data = getUser(userId);
  Object.keys(data).forEach((key) => (data[key] = 0));
  saveData();
  return data;
}

function statTotal(stats) {
  return Object.values(stats).reduce((sum, n) => sum + n, 0);
}

module.exports = {
  DEFAULT_STATS,
  memory,
  loadData,
  saveData,
  getUser,
  incrementStat,
  resetUser,
  statTotal,
};
