import { SlashCommandBuilder, CommandInteraction, Client } from "discord.js";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("応答している場合は、Pong!と返します。"),
  execute: async function (interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  },
};
