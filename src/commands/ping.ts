import { CommandInteraction, EmbedBuilder } from "discord.js";

export const ping = {
    name: "ping",
    description: "Renvoit la latence du bot ! 🏓",

    async execute(interaction: CommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle("Pong ! 🏓")
            .setDescription(`**Latence** : ${interaction.client.ws.ping}ms !`)
            .setColor("#F6CD55")
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
