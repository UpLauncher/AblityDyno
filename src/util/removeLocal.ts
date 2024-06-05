import { REST, Routes } from "discord.js";
import { token, clientId, guildId } from "../config/config.json";

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    rest
      .put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
      .then(() => console.log("Successfully deleted all guild commands."))
      .catch(console.error);
  } catch (error) {
    console.error(error);
  }
})();
