# Lunar Consort

A gothic, moon-themed Discord roleplay bot. Users build up a "lunar profile"
of stats (longing, memory, betrayal, worship, etc.) by using themed slash
commands on each other.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DISCORD_TOKEN` — your bot's token
   - `CLIENT_ID` — your application's client ID
   - `GUILD_ID` — the server ID to register commands in
3. `npm start`

## Project structure

```
index.js                 Entry point: client setup, login, graceful shutdown
src/
  data.js                 Stat persistence (data.json) and per-user stat map
  moon.js                 Real moon-phase calculation used in every embed footer
  embeds.js                Shared embed builders/theming
  content.js                Weapons, reply templates, fortunes, titles, /ship tiers
  cooldowns.js               Per-command cooldown durations
  validation.js              Blocks bot targets and self-targeting for /slap & /kill
  commands/
    register.js             Builds and registers all slash commands
    handlers.js              Routes interactions to their logic
```

## What changed from the original single-file version

**Bug fixes / hardening**
- `/slap` and `/kill` can no longer target yourself or a bot
- All target commands now reject bots as targets
- Every action command now tracks its own stat (previously `/confess`,
  `/expose`, `/resent`, `/linger`, `/haunt`, `/curse`, `/worship`, and
  `/watch` did nothing to your profile)

**New features**
- `/ship @user1 @user2` — a themed compatibility reading between two users
  (deterministic, so the same pair always gets the same score)
- `/reset` now asks for confirmation via buttons before wiping your profile
- Per-command cooldowns (e.g. `/reset` is 30s, `/help` is 3s) instead of one
  flat 10s for everything
- `/profile` now renders stats as embed fields instead of one long text block
- `.env.example`, `.gitignore`, and this README for easier setup

**Code quality**
- Split the original 693-line `index.js` into focused modules (data,
  content, embeds, moon phase, cooldowns, validation, command registration,
  interaction handling)

## Data storage

User stats persist to `data.json` in the project root (created automatically).
Don't commit this file — it's already in `.gitignore`.
