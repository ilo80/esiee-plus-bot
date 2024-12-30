import { CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { getAvailableClassroom } from '../utils/ade';
import { convertDateFormat, isValidDate } from '../utils/date';
import { convertTimeFormat, addTime, Time } from '../utils/time';
import { sendErrorEmbed } from '../utils/embed';

const ERROR_INVALID_DATE = "Il semblerait que la date renseignée ne soit pas valide !\nVeuillez renseigner une date au format `jj/mm/aaaa`.";
const ERROR_INVALID_TIME = "Il semblerait que l'heure de début ou de fin renseignée ne soit pas valide !\nVeuillez renseigner une heure au format `hh:mm`.";
const ERROR_INVALID_EPIS = "Il semblerait que l'épis renseigné ne soit pas valide !\nVeuillez renseigner un numéro d'épis entre 0 et 6.";
const ERROR_START_AFTER_END = "Il semblerait que l'heure de début soit supérieure ou égale à l'heure de fin !\nVeuillez renseigner une heure de début inférieure à l'heure de fin.";
const NO_CLASSROOMS_AVAILABLE = "Aucune salle n'est disponible à cette période !\nVeuillez réessayer avec une autre période.";

export const recherche_salles = {
    name: "recherche_salles",
    description: "Trouves des salles libres sur une période donnée ! 🚪",
    options: [
        { name: "date", description: "La date à laquelle tu veux trouver des salles libres", type: ApplicationCommandOptionType.String, required: false },
        { name: "debut", description: "L'heure de début de la période", type: ApplicationCommandOptionType.String, required: false },
        { name: "fin", description: "L'heure de fin de la période", type: ApplicationCommandOptionType.String, required: false },
        { name: "epis", description: "L'épis dans lequel tu veux faire la recherche", type: ApplicationCommandOptionType.Integer, required: false }
    ],

    async execute(interaction: CommandInteraction) {
        const now = new Date(); // Get the current date

        const epis = interaction.options.get("epis")?.value as number ?? -1;
        const date = interaction.options.get("date")?.value as string ?? now.toLocaleDateString("fr-FR");
        const startHourString = interaction.options.get("debut")?.value as string ?? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        const startHour = convertTimeFormat(startHourString);

        const endHourString = interaction.options.get("fin")?.value as string ?? null;
        const endHour = endHourString ? convertTimeFormat(endHourString) : addTime(startHour, 60); // Add 1 hour to the start hour if the end hour is not provided

        if (!isValidDate(date)) {
            await sendErrorEmbed(interaction, ERROR_INVALID_DATE);
            return;
        }

        if (!isValidTime(startHour) || !isValidTime(endHour)) {
            await sendErrorEmbed(interaction, ERROR_INVALID_TIME);
            return;
        }

        if (epis < -1 || epis > 6) {
            await sendErrorEmbed(interaction, ERROR_INVALID_EPIS);
            return;
        }

        if (startHour >= endHour) {
            await sendErrorEmbed(interaction, ERROR_START_AFTER_END);
            return;
        }

        const classrooms = await getAvailableClassroom(convertDateFormat(date), startHour, endHour);
        const sortedClassrooms = classrooms.sort((a, b) => a.localeCompare(b));

        const filteredClassrooms = epis !== -1 ? sortedClassrooms.filter(classroom => parseInt(classroom[0]) === epis) : sortedClassrooms; // Filter classrooms by epis

        if (filteredClassrooms.length === 0) {
            await sendErrorEmbed(interaction, NO_CLASSROOMS_AVAILABLE);
            return;
        }

        const groupedClassrooms = filteredClassrooms.reduce<Record<number, string[]>>( // Group classrooms by epis
            (acc, classroom) => {
                const e = parseInt(classroom[0]); // Get the epis number

                if (!acc[e]) acc[e] = []; // Initialize the array if it doesn't exist

                acc[e].push(classroom); // Push the classroom to the array
                return acc;
            },
            {}
        );

        const embedField = Object.keys(groupedClassrooms).map(epis => {
            return {
                name: `Épis ${epis}`,
                value: groupedClassrooms[parseInt(epis)].map(classroom => `- ${classroom}`).join("\n"),
                inline: true
            };
        });

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle(`Salles libres le ${date} de ${startHour} à ${endHour}`)
            .setFields(embedField)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};
