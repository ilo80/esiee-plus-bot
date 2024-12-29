import { CommandInteraction, EmbedBuilder } from "discord.js";

export const sendErrorEmbed = async (interaction : CommandInteraction, errorMessage : string) => {
    const embed = new EmbedBuilder()
        .setTitle("Erreur !")
        .setDescription(errorMessage)
        .setColor("#F04747")
        .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
};
