import { REST, Routes } from "discord.js";
import { token, clientId, guildId } from "../config/config.json";
import fs from "fs";

const commands = [];
const adminCommands = [];
const commandFiles = fs
  .readdirSync("./src/commands")
  .filter((file) => file.endsWith(".ts"));
const adminCommandFiles = fs
  .readdirSync("./src/commands/admin")
  .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.push(command.data.toJSON());
}

for (const file of adminCommandFiles) {
  const command = require(`../commands/admin/${file}`);
  commands.push(command.data.toJSON());
}
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    const startTime = performance.now();
    // const data = (await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })) as any;
    const data = (await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    })) as any;

    const endTime = performance.now();

    console.log(
      `Register completed! (${data.length} commands, ${endTime - startTime}ms)`
    );
  } catch (error) {
    console.error(error);
  }
})();
