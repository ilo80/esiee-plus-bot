import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from "discord.js";
import { filterClassrooms, initializeAPI, correctClassroomName, getClassroomFreeDuration, getClassroomInformations, getClassroomResource, checkClassroomAvailability, getClassroomOccupiedDuration } from "../utils/ade";
import { sendErrorEmbed } from "../utils/embed"
import { Time } from "../utils/time";
import { Resource } from "ade-planning-api/dist/models/timetable";

const ERROR_INVALID_CLASSROOM = "Il semblerait que la salle renseignée ne soit pas valide !\nVeuillez renseigner un nom de salle valide.";

const getEmojis = (statut: boolean, locked: boolean, board: string, capacity: number) => {
    const statusEmoji = statut ? "🟢" : "🔴"; // Set the status emoji
    const lockedEmoji = locked ? "🔐" : "🔓"; // Set the locked emoji

    const boardEmoji = {
        "Tableau blanc": "⬜",
        "Tableau noir": "⬛",
    }[board] ?? "❓"; // Set the board emoji

    const capacityRanges: { range: number, emoji: string }[] = [
        { range: 16, emoji: "👥" }, // Small capacity
        { range: 32, emoji: "🧑‍🤝‍🧑" }, // Medium capacity
        { range: Infinity, emoji: "🏢" } // Large capacity
    ];

    const capacityEmoji = capacityRanges.find(range => capacity <= range.range)?.emoji ?? ''; // Set the capacity emoji

    return { statusEmoji, lockedEmoji, boardEmoji, capacityEmoji }; // Return the emojis
};

export const statut_salle = {
    name: "statut_salle",
    description: "Affiche le statut d'une salle de l'ESIEE ! 🟢",
    options: [
        { name: "salle", description: "Le nom de la salle dont tu veux connaître le statut", type: ApplicationCommandOptionType.String, required: true }
    ],

    async execute(interaction: CommandInteraction) {
        const classroom = interaction.options.get("salle")?.value as string; // Get the classroom name

        const api = await initializeAPI(); // Initialize the ADE API
        const resources = await api.getResources({ detail: 3 }); // Get all resources
        const classrooms = filterClassrooms(resources); // Filter classrooms

        const correctedClassroom = correctClassroomName(classrooms, classroom); // Correct the classroom name

        if (!correctedClassroom) {
            await sendErrorEmbed(interaction, ERROR_INVALID_CLASSROOM);
            return;
        }

        const classroomId = (classrooms.find((classroom) => classroom.name === correctedClassroom) as Resource).id; // Find the classroom resource

        const now = new Date(); // Get the current date

        const time = { hours: now.getHours(), minutes: now.getMinutes() } as Time; // Get the current time
        const endTime = { hours: 22, minutes: 0 } as Time; // Set the end time to 22:00

        const freeDuration = await getClassroomFreeDuration(api, classroomId, now, time, endTime); // Get the free duration of the classroom
        const occupiedDuration = await getClassroomOccupiedDuration(api, classroomId, now, time, endTime); // Get the occupied duration of the classroom

        const classroomResource = await getClassroomResource(api, classroomId); // Get the classroom resource$

        const statut = freeDuration.hours > 0 || freeDuration.minutes > 0; // Check if the classroom is free

        const infos = await getClassroomInformations(classroomResource); // Get the classroom informations

        const emojis = getEmojis(statut, infos.locked, infos.board, infos.capacity); // Get the emojis

        const embedColor = !statut ? "#E74C3C" : infos.locked ? "#E69138" : "#2ECC71"; // Set the embed color

        const embed = new EmbedBuilder()
            .setTitle(`Statut de la salle ${correctedClassroom}`)
            .setDescription(`${infos.locked && statut ? `${emojis.lockedEmoji} **Statut** : Verrouillée` : `${emojis.statusEmoji} **Statut** : ${statut ? "Disponible" : "Occupée"}`}\n${!infos.locked && (freeDuration.hours || freeDuration.minutes) ? `🕑 **Durée de disponibilité** : ${freeDuration.hours}h${freeDuration.minutes.toString().padStart(2, "0")}\n` : (!infos.locked && freeDuration.hours === 0 && freeDuration.minutes === 0 ? `🕑 **Salle disponible dans** : ${occupiedDuration.hours}h${occupiedDuration.minutes.toString().padStart(2, "0")}\n` : "")}${emojis.boardEmoji} **Tableau** : ${infos.board}\n${infos.equipements && infos.equipements.length > 0 ? `🖨️ **Equipements** : ${infos.equipements.join(", ")}\n` : ""}${emojis.capacityEmoji} **Capacité** : ${infos.capacity} personnes`)
            .setColor(embedColor)
            .setTimestamp();

        interaction.editReply({ embeds: [ embed ]}); // Reply with the classroom informations	
    }
}
