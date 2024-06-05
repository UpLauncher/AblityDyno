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
    .setName("minecraft")
    .setDescription("マインクラフトについてのコマンド。")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("基本的な情報を表示します。")
        .addStringOption((option) =>
          option
            .setName("target")
            .setDescription("対象のMCID")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("images")
        .setDescription("体や頭の画像リンクを表示します。")
        .addStringOption((option) =>
          option
            .setName("target")
            .setDescription("対象のMCID")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cape")
        .setDescription("OptiFineマントの画像を表示します。")
        .addStringOption((option) =>
          option
            .setName("target")
            .setDescription("対象のMCID")
            .setRequired(true)
        )
    ),
  execute: async function (interaction: CommandInteraction) {
    let targetUser = null;
    if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "target"
      )
    ) {
      targetUser = (
        interaction.options as CommandInteractionOptionResolver
      ).getString("target");
    }

    const mojangProfile = await axios.get(
      "https://api.mojang.com/users/profiles/minecraft/" + targetUser
    );

    if (mojangProfile.status == 404) {
      const embed = new EmbedBuilder();
      embed.setAuthor({
        name: interaction.client.user.displayName,
        iconURL: interaction.client.user.displayAvatarURL(),
      });
      embed.setTitle(`ユーザー"${targetUser}"は見つかりませんでした。`);
      embed.setTimestamp(new Date());
      await interaction.reply({ embeds: [embed] });

      return;
    }

    if (
      (
        interaction.options as CommandInteractionOptionResolver
      ).getSubcommand() == "info"
    ) {
      const embed = new EmbedBuilder();
      embed.setAuthor({
        name: interaction.client.user.displayName,
        iconURL: interaction.client.user.displayAvatarURL(),
      });
      embed.setTitle(`${mojangProfile.data.name}のユーザー情報`);
      embed.setThumbnail("https://mc-heads.net/head/" + mojangProfile.data.id);
      embed.setTimestamp(new Date());
      embed.setImage("https://mc-heads.net/body/" + mojangProfile.data.id);
      embed.addFields(
        {
          name: "ユーザー名",
          value: `${mojangProfile.data.name}`,
        },
        {
          name: "UUID",
          value: `${mojangProfile.data.id}`,
        },
        {
          name: "スキンの全体URL",
          value: `https://mc-heads.net/body/${mojangProfile.data.id}`,
          inline: true,
        },
        {
          name: "NameMCで見る",
          value: `https://namemc.com/profile/${mojangProfile.data.id}`,
          inline: true,
        }
      );

      await interaction.reply({ embeds: [embed] });
    } else if (
      (
        interaction.options as CommandInteractionOptionResolver
      ).getSubcommand() == "images"
    ) {
      const embed = new EmbedBuilder();
      embed.setAuthor({
        name: interaction.client.user.displayName,
        iconURL: interaction.client.user.displayAvatarURL(),
      });
      embed.setTitle(`${mojangProfile.data.name}の画像URL`);
      embed.setThumbnail("https://mc-heads.net/head/" + mojangProfile.data.id);
      embed.setTimestamp(new Date());
      embed.setImage("https://mc-heads.net/body/" + mojangProfile.data.id);
      embed.addFields(
        {
          name: "スキンの全体URL",
          value: `https://mc-heads.net/body/${mojangProfile.data.id}`,
          inline: true,
        },
        {
          name: "スキンの全体(正面)URL",
          value: `https://mc-heads.net/player/${mojangProfile.data.id}`,
          inline: true,
        },
        {
          name: "スキンの頭URL",
          value: `https://mc-heads.net/head/${mojangProfile.data.id}`,
        },
        {
          name: "スキンの顔(正面)URL",
          value: `https://mc-heads.net/avatar/${mojangProfile.data.id}`,
          inline: true,
        }
      );

      await interaction.reply({ embeds: [embed] });
    } else if (
      (
        interaction.options as CommandInteractionOptionResolver
      ).getSubcommand() == "cape"
    ) {
      await interaction.reply({"content": "このコマンドは近日中に登場します。完成をお楽しみにしておいてください！", ephemeral: true});
    }
  },
};
