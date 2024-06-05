import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  CommandInteractionOptionResolver,
} from "discord.js";

import * as fs from "fs";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverlist")
    .setDescription("参加しているサーバーを表示します。"),
  execute: async function (interaction: CommandInteraction) {
    const serverListJson = new Array();

    let count = 0;

    interaction.client.guilds.cache.forEach((guild) => {
      count++;
      serverListJson.push({
        name: guild.name,
        id: guild.id,
        "boost-tiers": guild.premiumTier,
      });
      if (interaction.client.guilds.cache.size == count) {
        fs.writeFileSync(
          "src/config/serverlist.json",
          JSON.stringify(serverListJson)
        );
        interaction.reply({
          ephemeral: true,
          files: ["src/config/serverlist.json"],
        });
      }
    });
  },
};
