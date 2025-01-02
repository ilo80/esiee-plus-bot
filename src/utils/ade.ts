import { ADEPlanningAPI, Resources } from "ade-planning-api";
import { sleep } from "./sleep";
import { convertStringToTime, doTimeRangeOverlap, Time } from "./time";
import { Resource } from "ade-planning-api/dist/models/timetable"; // Import the Resource type from the ade-planning-api package
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
        /^[0-9]{4}(?:[+]|V(?:[+])?)?$/.test(resource.name) // Filter only classrooms with a valid name
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


export const checkClassroomAvailability = async (api: ADEPlanningAPI, classroomResource: Resource, date: Date, startHour: Time, endHour: Time) => {
    const events = await api.getEvents({ resources: classroomResource.id, date: convertDateToDateStringMMDDYYYY(date), detail: 3 }); // Get all events of the classroom in the specified date

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
        const isAvailable = await checkClassroomAvailability(api, classroomResource, date, startHour, endHour); // Check if the classroom is available

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
