import {
  SlashCommandBuilder,
  CommandInteraction,
  Client,
  EmbedBuilder,
  GuildManager,
} from "discord.js";
import { getClient } from "..";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("このBOTの参加しているサーバー数などを表示します。(統計)"),
  execute: async function (interaction: CommandInteraction) {
    const client = interaction.client;
    const embed = new EmbedBuilder()
      .setTitle("BOTの統計")
      .setDescription("このBOTの参加しているサーバー数などを表示します。")
      .addFields(
        {
          name: "参加しているサーバー数",
          value: `${client.guilds.cache.size.toString()} サーバー`,
        },
        {
          name: "チャンネル数",
          value: `${client.channels.cache.size} チャンネル`,
        },
        {
          name: "メンバー数",
          value: `${getMemberCount(client.guilds)} メンバー`,
        }
      )
      .setTimestamp(new Date());
    interaction.reply({ embeds: [embed] });
  },
};

function getMemberCount(guilds: GuildManager) {
  let gc = 0;
  guilds.cache.forEach((g) => {
    console.log(g.memberCount, g.id, g.name);
    gc += g.memberCount;
  });
  return gc;
}
