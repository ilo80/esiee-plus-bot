import { ADEPlanningAPI, Resources } from "ade-planning-api";
import { sleep } from "./sleep";
import { addTime, convertStringToTime, doTimeRangeOverlap, compareTimes, Time } from "./time";
import { Events, Resource } from "ade-planning-api/dist/models/timetable"; // Import the Resource type from the ade-planning-api package
import { convertDateToDateStringMMDDYYYY } from "./date";

export const initializeAPI = async () => {
    const api = new ADEPlanningAPI(process.env.ADE_LINK as string);

    await api.initializeSession({ username: process.env.ADE_USERNAME as string, password: process.env.ADE_PASSWORD as string });

    const projets = await api.getProjects(); // Get all projects
    await api.setProject(projets[0]); // Set to the first project (current year)

    return api;
};

export const filterClassrooms = (resources: Resources) => {
    return resources.filter((resource) =>
        resource.category === "classroom" && // Filter only classrooms
        /^[0-9]{4}(?:V|\+|V\+|V\+\+)?$/.test(resource.name) // Filter only classrooms with a valid name
    );
};

export const filterOutLabsExamsLocked = (classrooms: Resources) => {
    return classrooms.filter((classroom) =>
        /^[0-9]+$/.test(classroom.name) && // Filter only classrooms with a number
        !classroom.path.toLowerCase().includes("labos") && // Filter out labs
        !classroom.path.toLowerCase().includes("examens") && // Filter out exams
        !classroom.name.startsWith("6") && // Filter out classrooms of the 6th epis
        classroom.name !== "0351" && // Filter out the 0351 classroom
        classroom.name !== "0244" // Filter out the 0244 classroom
    );
};

export const checkClassroomAvailability = async (events: Events, startHour: Time, endHour: Time) => {
    for (const event of events) {
        if (doTimeRangeOverlap(startHour, endHour, convertStringToTime(event.startHour), convertStringToTime(event.endHour))) { // Check if the classroom is available
            return false;
        }
    }

    return true;
};

export const getAvailableClassroom = async (api: ADEPlanningAPI, classrooms: Resources, date: Date, startHour: Time, endHour: Time) => {
    const availableClassroom = [] as string[];

    for (const classroomResource of classrooms) {
        const events = await api.getEvents({ resources: classroomResource.id, date: convertDateToDateStringMMDDYYYY(date), detail: 3 }); // Get all events of the classroom in the specified date

        const isAvailable = await checkClassroomAvailability(events, startHour, endHour); // Check if the classroom is available

        if (isAvailable) {
            availableClassroom.push(classroomResource.name);
        }

        await sleep(100); // Sleep 100ms to avoid being banned
    }

    return availableClassroom;
};

export const correctClassroomName = (classrooms: Resources, classroom: string) => {
    const formattedClassroom = classroom.length === 3 ? `0${classroom}` : classroom; // Add a 0 at the beginning of the classroom name if it's only 3 characters long

    return classrooms.find((classroomResource) => classroomResource.name.includes(formattedClassroom))?.name;
};

export const getClassroomFreeDuration = async (api: ADEPlanningAPI, classroom: string, date: Date, startHour: Time, endHour: Time) => {
    const events = await api.getEvents({ resources: classroom, date: convertDateToDateStringMMDDYYYY(date), detail: 3 }); // Get all events of the classroom in the specified date

    let freeDuration = 0;
    let currentStartHour = startHour;

    while (compareTimes(currentStartHour, endHour) < 0) {
        const currentEndHour = addTime(currentStartHour, 1); // Add 1 minute to the current hour

        if (compareTimes(currentEndHour, endHour) > 0) {
            break;
        };

        const isAvailable = await checkClassroomAvailability(events, currentStartHour, currentEndHour); // Check if the classroom is available

        if (!isAvailable) {
            break;
        }

        freeDuration ++;
        currentStartHour = currentEndHour;
    }

    return { hours: Math.floor(freeDuration / 60), minutes: freeDuration % 60 } as Time; // Return the free duration
}

export const getClassroomOccupiedDuration = async (api: ADEPlanningAPI, classroom: string, date: Date, startHour: Time, endHour: Time) => {
    const events = await api.getEvents({ resources: classroom, date: convertDateToDateStringMMDDYYYY(date), detail: 3 }); // Récupère tous les événements de la salle à la date spécifiée

    let occupiedDuration = 0;
    let currentStartHour = startHour;

    while (compareTimes(currentStartHour, endHour) < 0) {
        const currentEndHour = addTime(currentStartHour, 1); // Ajoute 1 minute à l'heure actuelle

        if (compareTimes(currentEndHour, endHour) > 0) {
            break;
        };

        const isOccupied = !(await checkClassroomAvailability(events, currentStartHour, currentEndHour)); // Vérifie si la salle est occupée

        if (isOccupied) {
            occupiedDuration++;
        }

        currentStartHour = currentEndHour;
    }

    return { hours: Math.floor(occupiedDuration / 60), minutes: occupiedDuration % 60 } as Time; // Retourne la durée d'occupation
}


export const getClassroomInformations = async (classroom: Resource) => {
    const classroomInfo = classroom.info; // classroom.info = equipment
    const splittedInfo = classroomInfo.split(", ") // Split equipements

    const boardType = splittedInfo.find((info) => info.toLowerCase().includes("tableau")) ?? "Aucun"; // Get the board type
    const formattedBoardType = boardType.charAt(0).toUpperCase() + boardType.slice(1); // Format the board type

    const otherEquipments = splittedInfo.filter((info) => !info.toLowerCase().includes("tableau")); // Get other equipments

    const locked = classroom.name.endsWith("+") || classroom.name.endsWith("V") || classroom.name.endsWith("V+") || classroom.name.endsWith("V++"); // Check if the classroom is locked

    return {
        id: classroom.id,
        name: classroom.name,
        locked: locked,
        board: formattedBoardType,
        equipements: otherEquipments,
        capacity: classroom.size,
    };
};

export const getClassroomResource = async (api: ADEPlanningAPI, classroomId: number) => {
    const resources = await api.getResources({ detail: 11, id: classroomId }); // Get all resources

    if (resources.length !== 1) {
        throw new Error("Invalid classroom resource");
    }

    return resources[0];
};