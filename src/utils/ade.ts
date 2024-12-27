import { ADEPlanningAPI } from "ade-planning-api";
import { sleep } from "./sleep";
import { doTimeRangeOverlap } from "./date";

export const getAvailableClassroom = async (date: string, startHour: string, endHour: string) => {
    const api = new ADEPlanningAPI(process.env.ADE_LINK as string);

    await api.initializeSession({ username: process.env.ADE_USERNAME as string, password: process.env.ADE_PASSWORD as string });

    const projets = await api.getProjects(); // Get all projects
    await api.setProject(projets[0]); // Set to the first project (current year)

    const resources = await api.getResources({ detail: 3 }); // Get all resources

    const classroom = resources.filter((resource) => 
        resource.category === "classroom" && // Filter only classrooms
        /^[0-9]+$/.test(resource.name) && // Filter only classrooms with a number
        !resource.path.toLowerCase().includes("labos") && // Filter out labs
        !resource.path.toLowerCase().includes("examens") && // Filter out exams
        !resource.name.startsWith("6") && // Filter out classrooms of the 6th epis
        resource.name !== "0351" && // Filter out the 0351 classroom
        resource.name !== "0244" // Filter out the 0244 classroom
    );

    const availableClassroom = [] as string[];

    for (const classroomResource of classroom) {
        const events = await api.getEvents({ resource: classroomResource.id, date: date, detail: 3 }); // Get all events of the classroom in the specified date

        let isAvailable = true;

        for (const event of events) {
            if (doTimeRangeOverlap(startHour, endHour, event.startHour, event.endHour)) { // Check if the classroom is available
                isAvailable = false;
                break;
            }
        }

        if (isAvailable) {
            availableClassroom.push(classroomResource.name);
        }

        await sleep(100); // Sleep 100ms to avoid being banned
    }

    await api.terminateSession(); // Terminate the session

    return availableClassroom;
};
