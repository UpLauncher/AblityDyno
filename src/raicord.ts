import {
  Client,
  Collection,
  Colors,
  Embed,
  EmbedBuilder,
  User,
} from "discord.js";

export interface RaiClient extends Client {
  commands: Collection<string, any>;
  adminCommands: Collection<string, any>;
}

export function noPermissionEmbed(client: Client, user: User) {
  const embed = new EmbedBuilder();
  embed.setAuthor({
    name: client.user!.displayName,
    iconURL: client.user!.displayAvatarURL(),
  });
  embed.setTitle(`権限が不足しています`);
  embed.setDescription(
    "あなたは権限がないため、このコマンドを使用することができません。"
  );
  embed.setColor(Colors.Red);
  embed.setThumbnail(
    user?.displayAvatarURL() ||
      "https://discord.com/assets/ac6f8cf36394c66e7651.png"
  );
  embed.setTimestamp(new Date());
  return embed;
}

export function botNoPermissionEmbed(client: Client, user: User) {
  const embed = new EmbedBuilder();
  embed.setAuthor({
    name: client.user!.displayName,
    iconURL: client.user!.displayAvatarURL(),
  });
  embed.setTitle(`BOTの権限が不足しています`);
  embed.setDescription(
    "BOTの権限がないため、このコマンドを使用することができません。\nこのBOTの権限が足りないか、ロールが対象より下です。"
  );
  embed.setColor(Colors.Red);
  embed.setThumbnail(
    user?.displayAvatarURL() ||
      "https://discord.com/assets/ac6f8cf36394c66e7651.png"
  );
  embed.setTimestamp(new Date());
  return embed;
}

export function isPermissionIssue(error: any) {
    if (error.toString().includes("Missing Permissions")) {
        return true
    } else {
        return false
    }
}