import { CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { getAvailableClassroom, initializeAPI, filterClassrooms, filterOutLabsExamsLocked } from '../utils/ade';
import { convertStringToTime, addTime, isValidTimeString, convertTimeToString } from '../utils/time';
import { sendErrorEmbed } from '../utils/embed';
import { convertDateStringDDMMYYYYToDate, convertDateToDateStringDDMMYYYY, isValidDateString } from '../utils/date';

const ERROR_INVALID_DATE = "Il semblerait que la date renseignée ne soit pas valide !\nVeuillez renseigner une date au format `jj/mm/aaaa`.";
const ERROR_INVALID_TIME = "Il semblerait que l'heure de début ou de fin renseignée ne soit pas valide !\nVeuillez renseigner une heure au format `hh:mm`.";
const ERROR_INVALID_EPIS = "Il semblerait que l'épi renseigné ne soit pas valide !\nVeuillez renseigner un numéro d'épi entre 0 et 6.";
const ERROR_START_AFTER_END = "Il semblerait que l'heure de début soit supérieure ou égale à l'heure de fin !\nVeuillez renseigner une heure de début inférieure à l'heure de fin.";
const ERROR_INVALID_YEAR = "La recherche d'années doit se faire entre 2024 et 2026.";
const NO_CLASSROOMS_AVAILABLE = "Aucune salle n'est disponible à cette période !\nVeuillez réessayer avec une autre période.";

export const recherche_salles = {
    name: "recherche_salles",
    description: "Trouves des salles libres sur une période donnée ! 🚪",
    options: [
        { name: "date", description: "La date à laquelle tu veux trouver des salles libres", type: ApplicationCommandOptionType.String, required: false },
        { name: "debut", description: "L'heure de début de la période", type: ApplicationCommandOptionType.String, required: false },
        { name: "fin", description: "L'heure de fin de la période", type: ApplicationCommandOptionType.String, required: false },
        { name: "epis", description: "L'épi dans lequel tu veux faire la recherche", type: ApplicationCommandOptionType.Integer, required: false }
    ],

    async execute(interaction: CommandInteraction) {
        const now = new Date(); // Get the current date

        const epis = interaction.options.get("epis")?.value as number ?? -1; // Get the epis number if provided, -1 otherwise
        const dateString = interaction.options.get("date")?.value as string ?? now.toLocaleDateString("fr-FR"); // Get the date if provided, the current date otherwise

        if (!isValidDateString(dateString)) {
            await sendErrorEmbed(interaction, ERROR_INVALID_DATE);
            return;
        }

        const date = convertDateStringDDMMYYYYToDate(dateString); // Convert the date to a Date object
        const year = date.getFullYear();
        
        if (year < 2024 || year > 2026) {
            await sendErrorEmbed(interaction, ERROR_INVALID_YEAR);
            return;
        }

        const startHourString = interaction.options.get("debut")?.value as string ?? now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); // Get the start hour if provided, the current hour otherwise

        if (!isValidTimeString(startHourString)) {
            await sendErrorEmbed(interaction, ERROR_INVALID_TIME);
            return;
        }

        const startHour = convertStringToTime(startHourString); // Convert the start hour to a Time object

        const endHourString = interaction.options.get("fin")?.value as string ?? null; // Get the end hour if provided, null otherwise

        if (endHourString != null && !isValidTimeString(endHourString)) {
            await sendErrorEmbed(interaction, ERROR_INVALID_TIME);
            return;
        }

        const endHour = endHourString ? convertStringToTime(endHourString) : addTime(startHour, 60); // Add 1 hour to the start hour if the end hour is not provided

        if (epis < -1 || epis > 6) {
            await sendErrorEmbed(interaction, ERROR_INVALID_EPIS);
            return;
        }

        if (convertTimeToString(startHour) >= convertTimeToString(endHour)) {
            await sendErrorEmbed(interaction, ERROR_START_AFTER_END);
            return;
        }

        const adeAPI = await initializeAPI(); // Initialize the ADE API

        const resources = await adeAPI.getResources({ detail: 3 }); // Get all resources
        const classrooms = filterClassrooms(resources); // Filter classrooms
        const excludeClassrooms = filterOutLabsExamsLocked(classrooms); // Filter out labs, exams, and locked classrooms

        const availableClassroom = await getAvailableClassroom(adeAPI, excludeClassrooms, date, startHour, endHour);
        const sortedClassrooms = availableClassroom.sort((a, b) => a.localeCompare(b));

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

        await adeAPI.terminateSession(); // Terminate the session

        const embedField = Object.keys(groupedClassrooms).map(epis => {
            return {
                name: `Épi ${epis}`,
                value: groupedClassrooms[parseInt(epis)].map(classroom => `- ${classroom}`).join("\n"),
                inline: true
            };
        });

        const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle(`Salles libres le ${convertDateToDateStringDDMMYYYY(date)} de ${convertTimeToString(startHour)} à ${convertTimeToString(endHour)}`)
            .setFields(embedField)
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    }
};
