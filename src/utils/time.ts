export type Time = {
    hours: number;
    minutes: number;
};

export const isValidTimeString = (time: string) => {
    const parts = time.split(':').map(Number);

    if (parts.length !== 2) {
        return false;
    }

    if (isNaN(parts[0]) || isNaN(parts[1])) {
        return false;
    }

    return parts[0] >= 0 && parts[0] <= 23 && parts[1] >= 0 && parts[1] <= 59;
};

export const convertTimeFormat = (time: string) => {
    if (!isValidTimeString(time)) {
        throw new Error('Invalid time format');
    }

    const [hours, minutes] = time.split(':').map(Number);

    return { hours, minutes } as Time;
};

export const doTimeRangeOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);

    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

export const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
}


export const add1Hour = (hour: string) => {
    const [h, m] = hour.split(":").map(Number);
    const newHourDate = new Date();

    newHourDate.setHours(h);
    newHourDate.setMinutes(m + 60);

    return newHourDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

