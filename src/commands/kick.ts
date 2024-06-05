import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  CommandInteractionOptionResolver,
  PermissionFlagsBits,
} from "discord.js";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("ユーザーをキックします。")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("対象のユーザー")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async function (interaction: CommandInteraction) {
    if (
      (interaction.options as CommandInteractionOptionResolver).getUser(
        "target"
      )
    ) {
      let targetUser = (
        interaction.options as CommandInteractionOptionResolver
      ).getUser("target");

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
          embed.setDescription("# 注意: このコマンドはv1.2で削除されます。代わりに/user kickを使用してください。")
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        })
        .catch(async (reason) => {
          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(`ユーザーの操作に失敗しました。`);
          embed.setDescription("# 注意: このコマンドはv1.2で削除されます。代わりに/user kickを使用してください。")
          embed.setThumbnail(
            targetUser?.displayAvatarURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed] });
        });
    }
  },
};
