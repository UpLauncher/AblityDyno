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
    .setName("blacklist")
    .setDescription("ブラックリストを操作します。")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("ブラックリストにユーザーを追加します。")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("対象のユーザー")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("ブラックリストのユーザーを表示します。")
    ),
  execute: async function (interaction: CommandInteraction) {
    const interactionOptions =
      interaction.options as CommandInteractionOptionResolver;
    const subCommand = interactionOptions.getSubcommand();

    if (subCommand == "add") {
      if (interactionOptions.getUser("target")) {
        let targetUser = (
          interaction.options as CommandInteractionOptionResolver
        ).getUser("target");

        const blacklistFile = fs.readFileSync("src/config/blacklist.json");
        const blacklistJson = JSON.parse(
          blacklistFile.toString()
        ) as Array<string>;
        blacklistJson.push(targetUser?.id.toString() || "0");
        fs.writeFileSync("src/config/blacklist.json", JSON.stringify(blacklistJson));

        const embed = new EmbedBuilder();
        embed.setAuthor({
          name: interaction.client.user.displayName,
          iconURL: interaction.client.user.displayAvatarURL(),
        });
        embed.setTitle(
          `${targetUser?.displayName} (${targetUser?.username})をブラックリストに追加しました。`
        );
        embed.setThumbnail(
          targetUser?.displayAvatarURL() ||
            "https://discord.com/assets/ac6f8cf36394c66e7651.png"
        );
        embed.setTimestamp(new Date());
        await interaction.reply({ embeds: [embed] });
      }
    } else if (subCommand == "list") {
      const blacklistFile = fs.readFileSync("src/config/blacklist.json");
      const blacklistJson = JSON.parse(
        blacklistFile.toString()
      ) as Array<string>;
      let blacklistUsers = "";
      blacklistJson.forEach((val) => {
        blacklistUsers += `<@${val}>\n`
      })
      const embed = new EmbedBuilder();
      embed.setAuthor({
        name: interaction.client.user.displayName,
        iconURL: interaction.client.user.displayAvatarURL(),
      });
      embed.setTitle("ブラックリストのユーザー")
      embed.setDescription("ブラックリストのユーザーを表示します。")
      embed.addFields({name: "ユーザー", value: blacklistUsers})
      embed.setTimestamp(new Date());
      await interaction.reply({ embeds: [embed] });

    }
  },
};
