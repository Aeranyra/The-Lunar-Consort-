const { EmbedBuilder } = require("discord.js");
const { moonFooter } = require("./moon");

const THEME_COLOR = "#4A4A6B";

function baseEmbed() {
  return new EmbedBuilder().setFooter({ text: moonFooter() }).setTimestamp().setColor(THEME_COLOR);
}

function makeEmbed(text) {
  return baseEmbed().setTitle("🌙 Lunar Consort").setDescription(text);
}

module.exports = { makeEmbed, baseEmbed, THEME_COLOR };
