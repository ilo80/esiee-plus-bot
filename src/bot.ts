import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

export const client = new Client( { intents: GatewayIntentBits.Guilds } ); // Create a new client with the Guilds intent

const rest = new REST().setToken( process.env.DISCORD_TOKEN as string ); // Create a new REST client and set the token

client.once(Events.ClientReady, async () => {
    console.log("Bot is ready!");
});