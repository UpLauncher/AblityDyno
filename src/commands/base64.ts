import axios from "axios";
import {
  SlashCommandBuilder,
  CommandInteraction,
  Client,
  EmbedBuilder,
  CommandInteractionOptionResolver,
} from "discord.js";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("base64")
    .setDescription("base64をエンコードしたりデコードします。")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("encode")
        .setDescription("指定したテキストをBase64エンコードします。")
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("Base64にエンコードするテキスト")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("decode")
        .setDescription("指定したBase64をデコードします。")
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("テキストにデコードするBase64")
            .setRequired(true)
        )
    ),
  execute: async function (interaction: CommandInteraction) {
    let text = null;
    const interactionOptions =
      interaction.options as CommandInteractionOptionResolver;
    const subCommand = interactionOptions.getSubcommand();
    text = interactionOptions.getString("text");

    if (subCommand == "encode") {
      await interaction.reply({ content: "```\n" + btoa(text!) + "\n```" });
    } else if (subCommand == "decode") {
      await interaction.reply({ content: "```\n" + atob(text!) + "\n```" });
    }
  },
};
