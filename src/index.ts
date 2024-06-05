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

  setInterval(() => {
    if (!client.user) return;

    const activities = ["こんにちは👋", "TypeScriptで作成", "v0.0.1-beta"];

    const randomIndex = Math.floor(Math.random() * activities.length);
    const newActivity = activities[randomIndex];

    client.user.setActivity(
      `${newActivity} | v1.1-beta.2 | ${client.guilds.cache.size} guilds`
    );
  }, 10_000);

  client.commands = new Collection();
  client.adminCommands = new Collection();

  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      console.log(`[COMMAND] Command registered! ${command.data.name}`);
    } else {
      console.log(`[COMMAND] ${filePath} is not valid command file.`);
    }
  }

  //admin register

  const adminCommandsPath = path.join(__dirname, "commands", "admin");
  const adminCommandFiles = fs
    .readdirSync(adminCommandsPath)
    .filter((file) => file.endsWith(".ts"));

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
  if (interaction.isButton() && interaction.customId.startsWith("verify-")) {
    const uuid = interaction.customId.replace("verify-", "");
    const targetJson = readFileSync(
      "src/config/userable/verifyPanel-" + uuid + ".json"
    );
    const config = JSON.parse(targetJson.toString());

    if (
      interaction.guild?.id == config.targetServerId &&
      interaction.channel?.id == config.targetChannelId
    ) {
      if (
        (interaction.member as GuildMember)?.roles.cache.some(
          (role) => role.id === config.targetRoleId
        )
      ) {
        interaction.reply({
          content: "あなたはすでに認証されています",
          ephemeral: true,
        });
      } else {
        const targetRole = interaction.guild?.roles.cache.find(
          (role) => role.id === config.targetRoleId
        );
        if (targetRole) {
          (interaction.member as GuildMember)?.roles
            .add(targetRole)
            .then((member) => {
              interaction.reply({
                content: `<@&${config.targetRoleId}>を付与しました。(認証成功)`,
                ephemeral: true,
              });
            }).catch((error) => {
              interaction.reply({content: "メンバーの認証に失敗しました: " + error, ephemeral: true})
            });
        } else {
          interaction.reply({
            content:
              "対象のロールが見つかりませんでした。サーバーの管理者にお問い合わせしてください。",
            ephemeral: true,
          });
        }
      }
    }
  }

  if (!interaction.isChatInputCommand()) return;

  const blacklistFile = fs.readFileSync("src/config/blacklist.json");
  const blacklistJson = JSON.parse(blacklistFile.toString()) as Array<string>;
  if (blacklistJson.includes(interaction.user.id)) {
    const embed = new EmbedBuilder();
    embed.setAuthor({
      name: interaction.client.user.displayName,
      iconURL: interaction.client.user.displayAvatarURL(),
    });
    embed.setTitle(`申し訳ございません`);
    embed.setDescription(
      "あなたは、このBOTを使用することができません。\n詳細については、雷のDiscordサーバーにあるチケットチャンネルからチケットを作成し、このメッセージの画像を添付してください。\nご迷惑をおかけし、申し訳ございません。"
    );
    embed.setThumbnail(
      interaction.user.displayAvatarURL() ||
        "https://discord.com/assets/ac6f8cf36394c66e7651.png"
    );
    embed.setTimestamp(new Date());
    await interaction.reply({ embeds: [embed] });
    return;
  }

  const file = fs.readFileSync("src/config/admin.json");
  const json = JSON.parse(file.toString()) as Array<string>;

  const adminCommand = (interaction.client as RaiClient).adminCommands.get(
    interaction.commandName
  );

  const command = (interaction.client as RaiClient).commands.get(
    interaction.commandName
  );

  if (!command && !adminCommand) {
    return;
  }

  if (command) {
    try {
      await command.execute(interaction);
    } catch (error: any) {
      if (!error.toString().includes("reading 'execute'")) {
        console.error("Error in commands:", error);
        await interaction.reply({
          content:
            "コマンドの実行中に、エラーが発生しました。もう一度お試しください。",
          ephemeral: true,
        });
      }
    }
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
