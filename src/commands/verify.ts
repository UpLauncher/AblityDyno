import axios from "axios";
import {
  SlashCommandBuilder,
  CommandInteraction,
  Client,
  EmbedBuilder,
  CommandInteractionOptionResolver,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { writeFileSync } from "fs";

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。
module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("認証パネルを作成します。")
    .addRoleOption((option) =>
      option
        .setName("target")
        .setDescription("認証後に付与するロール")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async function (interaction: CommandInteraction) {
    // let text = null;
    const interactionOptions =
      interaction.options as CommandInteractionOptionResolver;
    const targetRole = interactionOptions.getRole("target");
    const uniqueId = uuidv4();
    // const subCommand = interactionOptions.getSubcommand();
    // text = interactionOptions.getString("text");

    // if (subCommand == "encode") {
    //   await interaction.reply({ content: "```\n" + btoa(text!) + "\n```" });
    // } else if (subCommand == "decode") {
    //   await interaction.reply({ content: "```\n" + atob(text!) + "\n```" });
    // }

    const embed = new EmbedBuilder()
      .setTitle("認証する")
      .setDescription(
        `認証ボタンを押して、認証してください。(付与されるロール: <@&${targetRole?.id}>)`
      );

    const verify = new ButtonBuilder()
      .setCustomId("verify-" + uniqueId)
      .setLabel("認証")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>({ components: [verify] });

    writeFileSync(
      "src/config/userable/verifyPanel-" + uniqueId + ".json",
      JSON.stringify({
        id: uniqueId,
        targetRoleId: targetRole?.id,
        targetServerId: interaction.guild?.id,
        targetChannelId: interaction.channel?.id,
      })
    );

    interaction.channel?.send({ embeds: [embed], components: [row] });

    interaction.reply({
      content: "認証パネルが作成されました！",
      ephemeral: true,
    });
  },
};
