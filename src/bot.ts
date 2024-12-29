import { Client, EmbedBuilder, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";

// Import commands
import { ping } from "./commands/ping";
import { edt } from "./commands/edt";
import { sendErrorEmbed } from "./utils/embed";

const ERROR_COMMAND = "Uh ! Oh ! Il s'emblerait qu'une erreur soit survenue lors de l'exécution de la commande !";

dotenv.config(); // Load .env file

export const client = new Client( { intents: GatewayIntentBits.Guilds } ); // Create a new client with the Guilds intent

const rest = new REST().setToken( process.env.DISCORD_TOKEN as string ); // Create a new REST client and set the token

const commands = [ ping, edt ]; // List of commands

client.once(Events.ClientReady, async () => {
    console.log("Bot is ready!");

    await rest.put( Routes.applicationGuildCommands( client.user?.id as string, process.env.DISCORD_GUILD_ID as string ), { body: commands } ); // Register commands

    console.log("Commands registered!");
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.find( command => command.name === interaction.commandName ); // Find the command

    if (command) {
        await interaction.deferReply(); // Defer the reply to avoid the 3 seconds timeout

        try {
            await command.execute( interaction ); // Execute the command
        } catch (error) {
            console.error(error); // Log the error
            await sendErrorEmbed(interaction, ERROR_COMMAND); // Send an error embed
        }
    }
});
