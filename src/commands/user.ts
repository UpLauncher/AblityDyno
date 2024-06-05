import {
  SlashCommandBuilder,
  CommandInteraction,
  Client,
  EmbedBuilder,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import {
  botNoPermissionEmbed,
  isPermissionIssue,
  noPermissionEmbed,
} from "../raicord";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("ユーザーやサーバーの情報を表示します。")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("ユーザーについての情報を出力します。")
        .addUserOption((option) =>
          option.setName("target").setDescription("対象のユーザー")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kick")
        .setDescription("ユーザーをサーバーからキックします。")
        .addUserOption((option) =>
          option.setName("target").setDescription("対象のユーザー").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ban")
        .setDescription("ユーザーをサーバーからBANします。")
        .addUserOption((option) =>
          option.setName("target").setDescription("対象のユーザー").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("理由")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("pardon")
        .setDescription("ユーザーのBANを解除します。")
        .addUserOption((option) =>
          option.setName("target").setDescription("対象のユーザー").setRequired(true)
        )
    ),
  execute: async function (interaction: CommandInteraction) {
    let targetUser = null;
    const interactionOptions =
      interaction.options as CommandInteractionOptionResolver;
    const subCommand = interactionOptions.getSubcommand();
    if (interactionOptions.getUser("target")) {
      targetUser = interactionOptions.getUser("target");
    } else {
      targetUser = interaction.user;
    }

    if (subCommand == "info") {
      //info

      const embed = new EmbedBuilder();
      embed.setAuthor({
        name: interaction.client.user.displayName,
        iconURL: interaction.client.user.displayAvatarURL(),
      });
      embed.setTitle(
        `${targetUser?.displayName} (${targetUser?.username})のユーザー情報`
      );
      embed.setThumbnail(
        targetUser?.displayAvatarURL() ||
          "https://discord.com/assets/ac6f8cf36394c66e7651.png"
      );
      embed.setTimestamp(new Date());
      if (targetUser?.bannerURL())
        embed.setImage(targetUser?.bannerURL() || "");
      embed.addFields(
        {
          name: "ユーザー名",
          value: `${targetUser?.displayName} (${targetUser?.username})`,
          inline: true,
        },
        {
          name: "アカウント作成日時",
          value: `<t:${Math.round(
            (targetUser?.createdTimestamp || 0) / 1000
          )}:f>`,
          inline: true,
        },
        {
          name: "Bot",
          value: targetUser?.bot ? "はい" : "いいえ",
          inline: true,
        }
      );
      await interaction.reply({ embeds: [embed] });
    } else if (subCommand == "ban") {
      //ban

      const interactionMember = interaction.member as GuildMember;
      if (
        !interactionMember.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        await interaction.reply({
          embeds: [noPermissionEmbed(interaction.client, interaction.user)],
        });
        return;
      }
      const reason = interactionOptions.getString("reason");

      interaction.guild?.members
        .ban(targetUser!, { reason: reason! })
        .then(async () => {
          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(
            `${targetUser?.displayName} (${targetUser?.username})をBANしました。`
          );
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        })
        .catch(async (reason) => {
          if (isPermissionIssue(reason)) {
            await interaction.reply({
              embeds: [
                botNoPermissionEmbed(interaction.client, interaction.user),
              ],
            });
            return;
          }
          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(`ユーザーの操作に失敗しました。`);
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.addFields({
            name: "エラーの理由",
            value: reason ? reason : "なし(不明)",
          });
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        });
    } else if (subCommand == "kick") {
      //kick

      const interactionMember = interaction.member as GuildMember;
      if (
        !interactionMember.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        await interaction.reply({
          embeds: [noPermissionEmbed(interaction.client, interaction.user)],
        });
        return;
      }
      interaction.guild?.members
        .kick(targetUser!)
        .then(async () => {
          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(
            `${targetUser?.displayName} (${targetUser?.username})をキックしました。`
          );
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        })
        .catch(async (reason) => {
          if (isPermissionIssue(reason)) {
            await interaction.reply({
              embeds: [
                botNoPermissionEmbed(interaction.client, interaction.user),
              ],
            });
            return;
          }
          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(`ユーザーの操作に失敗しました。`);
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        });
    } else if (subCommand == "pardon") {
      //pardon

      const interactionMember = interaction.member as GuildMember;
      if (
        !interactionMember.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        await interaction.reply({
          embeds: [noPermissionEmbed(interaction.client, interaction.user)],
        });
        return;
      }

      interaction.guild?.members
        .unban(targetUser!)
        .then(async () => {
          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(
            `${targetUser?.displayName} (${targetUser?.username})のBANを解除しました。`
          );
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        })
        .catch(async (reason) => {
          if (isPermissionIssue(reason)) {
            await interaction.reply({
              embeds: [
                botNoPermissionEmbed(interaction.client, interaction.user),
              ],
            });
            return;
          }

          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(`ユーザーの操作に失敗しました。`);
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.addFields({
            name: "エラーの理由",
            value: reason ? reason : "なし(不明)",
          });
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        });
    }
  },
};
