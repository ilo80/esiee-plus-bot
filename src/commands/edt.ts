import {  CommandInteraction, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { getAvailableClassroom } from '../utils/ade';
import { convertDateFormat, isValideDate } from '../utils/date';

const add1Hour = (hour: string) => {
    const [h, m] = hour.split(":").map(Number);
    const newHourDate = new Date();

    newHourDate.setHours(h);
    newHourDate.setMinutes(m + 60);

    return newHourDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

export const edt = {
    name: "edt",
    description: "Trouves des salles libres sur une période donnée ! 🚪",
    options: [
        { name: "date", description: "La date à laquelle tu veux trouver des salles libres", type: ApplicationCommandOptionType.String, required: false },
        { name: "debut", description: "L'heure de début de la période", type: ApplicationCommandOptionType.String, required: false },
        { name: "fin", description: "L'heure de fin de la période", type: ApplicationCommandOptionType.String, required: false },
        { name: "epis", description: "L'épis dans lequel tu veux faire la recherche", type: ApplicationCommandOptionType.Integer, required: false }
    ],

    async execute(interaction: CommandInteraction) {
        const date = interaction.options.get("date")?.value as string || new Date().toLocaleDateString("fr-FR");
        const startHour = interaction.options.get("debut")?.value as string || new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        const endHour = interaction.options.get("fin")?.value as string || add1Hour(startHour);
        const epis = interaction.options.get("epis")?.value as number ?? -1;

        if (!isValideDate(date)) {
            const embed = new EmbedBuilder()
                .setColor("#F04747")
                .setTitle("Erreur")
                .setDescription("Il semblerait que la date renseignée ne soit pas valide !\nVeuillez renseigner une date au format `jj/mm/aaaa`.")
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });

            return;
        }

        const classrooms = await getAvailableClassroom(convertDateFormat(date), startHour, endHour);
        const sortedClassrooms = classrooms.sort((a, b) => a.localeCompare(b));

        if (classrooms.length === 0) {
            await interaction.editReply("Aucune salle n'est disponible à cette période !");
            return;
        }

        const filteredClassrooms = epis !== -1 ? sortedClassrooms.filter(classroom => parseInt(classroom[0]) === epis) : sortedClassrooms; // Filter classrooms by epis

        const groupedClassrooms = {} as { [key: number]: string[] };

        filteredClassrooms.forEach(classroom => {
            const e = parseInt(classroom[0]);

            if (!groupedClassrooms[e]) {
                groupedClassrooms[e] = [];
            }

            groupedClassrooms[e].push(classroom);
        });

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
