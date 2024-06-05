import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  CommandInteractionOptionResolver,
  PermissionFlagsBits,
} from "discord.js";

import * as fs from "fs";

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("invites")
    .setDescription("サーバーへの招待を操作します。")
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateInstantInvite)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("get")
        .setDescription("サーバーにある招待の一覧を表示します。")
        // .addStringOption((option) =>
        //   option
        //     .setName("target")
        //     .setDescription("対象のサーバー")
        //     .setRequired(true)
        // )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("サーバーの招待を作成します。")
        // .addStringOption((option) =>
        //   option
        //     .setName("target")
        //     .setDescription("対象のサーバー")
        //     .setRequired(true)
        // )
    ),
  execute: async function (interaction: CommandInteraction) {
    if (
      (
        interaction.options as CommandInteractionOptionResolver
      ).getSubcommand() == "get"
    ) {
      if (
        (interaction.options as CommandInteractionOptionResolver).getString(
          "target"
        )
      ) {
        // let targetServer =
        //   (interaction.options as CommandInteractionOptionResolver).getString(
        //     "target"
        //   ) || "1079317216371146852";
        // let targetServer = interaction.guild?.id

        let count = 0;

        const serverListJson = new Array();
        // const targetServer = interaction.client.guilds.cache.find(
        //   (guild) => guild.id.toString() == targetServer
        // );
        let targetServer = interaction.guild;
        targetServer?.invites.fetch().then((invites) => {
          invites.forEach((invite) => {
            count++;
            serverListJson.push({
              url: invite.url,
              createdAt: invite.createdAt,
              channelId: invite.channelId,
              channelName: invite.channel?.name,
            });
            if (targetServer.invites.cache.size == count) {
              fs.writeFileSync(
                "src/config/latest-invitelist.json",
                JSON.stringify(serverListJson)
              );
              interaction.reply({
                ephemeral: true,
                files: ["src/config/latest-invitelist.json"],
              });
            }
          });
        });
      }
    } else {
      // let targetServer =
      //   (interaction.options as CommandInteractionOptionResolver).getString(
      //     "target"
      //   ) || "1079317216371146852";
      // const targetServer = interaction.client.guilds.cache.find(
      //   (guild) => guild.id.toString() == targetServer
      // );

      let targetServer = interaction.guild;
      if (targetServer?.rulesChannel) {
        targetServer?.invites.create(targetServer.rulesChannel).then(async (invite) => {
          const embed = new EmbedBuilder();
          embed.setAuthor({
            name: interaction.client.user.displayName,
            iconURL: interaction.client.user.displayAvatarURL(),
          });
          embed.setTitle(
            `サーバーの招待を作成しました。`
          );
          embed.setDescription("サーバーへの招待を作成しました！");
          embed.addFields({name: "チャンネル名", value: targetServer.rulesChannel?.name || "なし"}, {name: "チャンネルのID", value: targetServer.rulesChannel?.id || "なし"}, {name: "URL", value: invite.url || "なし"})
          embed.setThumbnail(
            targetServer.iconURL() ||
              "https://discord.com/assets/ac6f8cf36394c66e7651.png"
          );
          embed.setTimestamp(new Date());
          await interaction.reply({ embeds: [embed], ephemeral: true });
        })
      }
    }
  },
};
