import { ADEPlanningAPI, Resources } from "ade-planning-api";
import { sleep } from "./sleep";
import { convertTimeFormat, doTimeRangeOverlap, Time } from "./time";
import { Resource } from "ade-planning-api/dist/models/timetable"; // Import the Resource type from the ade-planning-api package

export const filterClassrooms = (resources: Resources) => {
    return resources.filter((resource) =>
        resource.category === "classroom" && // Filter only classrooms
        /^[0-9]+$/.test(resource.name) && // Filter only classrooms with a number
        !resource.path.toLowerCase().includes("labos") && // Filter out labs
        !resource.path.toLowerCase().includes("examens") && // Filter out exams
        !resource.name.startsWith("6") && // Filter out classrooms of the 6th epis
        resource.name !== "0351" && // Filter out the 0351 classroom
        resource.name !== "0244" // Filter out the 0244 classroom
    );
};

export const checkClassroomAvailability = async (api: ADEPlanningAPI, classroomResource: Resource, date: string, startHour: Time, endHour: Time) => {
    const events = await api.getEvents({ resources: classroomResource.id, date: date, detail: 3 }); // Get all events of the classroom in the specified date

    for (const event of events) {
        if (doTimeRangeOverlap(startHour, endHour, convertTimeFormat(event.startHour), convertTimeFormat(event.endHour))) { // Check if the classroom is available
            return false;
        }
    }

    return true;
};

export const getAvailableClassroom = async (date: string, startHour: Time, endHour: Time) => {
    const api = new ADEPlanningAPI(process.env.ADE_LINK as string);

    await api.initializeSession({ username: process.env.ADE_USERNAME as string, password: process.env.ADE_PASSWORD as string });

    const projets = await api.getProjects(); // Get all projects
    await api.setProject(projets[0]); // Set to the first project (current year)

    const resources = await api.getResources({ detail: 3 }); // Get all resources

    const classroom = filterClassrooms(resources); // Filter classrooms

    const availableClassroom = [] as string[];

    for (const classroomResource of classroom) {
        const isAvailable = await checkClassroomAvailability(api, classroomResource, date, startHour, endHour); // Check if the classroom is available

        if (isAvailable) {
            availableClassroom.push(classroomResource.name);
        }

        await sleep(100); // Sleep 100ms to avoid being banned
    }

    await api.terminateSession(); // Terminate the session

    return availableClassroom;
};
