import {
  Client,
  Collection,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  GuildMember,
} from "discord.js";
import { token, CanaryToken } from "./config/config.json";
import { RaiClient } from "./raicord";
import fs, { readFileSync } from "fs";
import path from "path";

const canaryMode = false;

const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as RaiClient;

client.once(Events.ClientReady, (baseClient) => {
  const client = baseClient as RaiClient;
  if (!client.user) {
    console.error("[ERROR] ClientUser is null. not valid token?");
    return;
  }
  console.log(`Ready! Logged as ${client.user.username}`);

  client.adminCommands = new Collection();

  //admin register

  const adminCommandsPath = path.join(__dirname, "commands", "admin");
  const adminCommandFiles = fs
    .readdirSync(adminCommandsPath)
    .filter((file) => file.endsWith("localEval.ts"));

  for (const file of adminCommandFiles) {
    const filePath = path.join(adminCommandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.adminCommands.set(command.data.name, command);
      console.log(`[COMMAND] Admin Command registered! ${command.data.name}`);
    } else {
      console.log(`[COMMAND] ${filePath} is not valid admin command file.`);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const file = fs.readFileSync("src/config/admin.json");
  const json = JSON.parse(file.toString()) as Array<string>;

  const adminCommand = (interaction.client as RaiClient).adminCommands.get(
    interaction.commandName
  );

  if (!adminCommand) {
    return;
  }

  if (adminCommand) {
    try {
      if (json.includes(interaction.user.id)) {
        console.log(interaction.commandName);
        await adminCommand.execute(interaction);
      } else {
        const embed = new EmbedBuilder();
        embed.setAuthor({
          name: interaction.client.user.displayName,
          iconURL: interaction.client.user.displayAvatarURL(),
        });
        embed.setTitle(`申し訳ございません`);
        embed.setDescription(
          "このコマンドを使用する権限がありません。\nこのコマンドは、管理者のみ使用することができます。"
        );
        embed.setThumbnail(
          interaction.user.displayAvatarURL() ||
            "https://discord.com/assets/ac6f8cf36394c66e7651.png"
        );
        embed.setTimestamp(new Date());
        await interaction.reply({ embeds: [embed] });
        return;
      }
    } catch (error: any) {
      console.error("Error in admin commands:", error);
      await interaction.reply({
        content:
          "コマンドの実行中に、エラーが発生しました。もう一度お試しください。",
        ephemeral: true,
      });
    }
  }
});

export function getClient() {
  return client;
}

client.login(canaryMode ? CanaryToken : token);
