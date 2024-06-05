import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  CommandInteractionOptionResolver,
} from "discord.js";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("コマンドを実行します。")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("実行するコマンド")
        .setRequired(true)
    ),
  execute: async function (interaction: CommandInteraction) {
    const interactionOptions =
      interaction.options as CommandInteractionOptionResolver;

    const evalResult = eval(interactionOptions.getString("command")!);
    await interaction.reply({
      content: evalResult ? evalResult.toString() : "_No Result_",
    });
  },
};
