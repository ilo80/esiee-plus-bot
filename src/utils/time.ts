export type Time = {
    hours: number;
    minutes: number;
};

export const isValidTimeString = (time: string) => {
    const normalizedTime = time.replace(/[hH]/g, ":");
    const parts = normalizedTime.split(':').map(Number);

    if (parts.length !== 2) {
        return false;
    }

    if (isNaN(parts[0]) || isNaN(parts[1])) {
        return false;
    }

    return parts[0] >= 0 && parts[0] <= 23 && parts[1] >= 0 && parts[1] <= 59;
};

export const convertStringToTime = (time: string) => {
    if (!isValidTimeString(time)) {
        throw new Error('Invalid time format');
    }
    
    const normalizedTime = time.replace(/[hH]/g, ":");
    const [hours, minutes] = normalizedTime.split(':').map(Number);

    return { hours, minutes } as Time;
};

export const convertTimeToString = (time: Time) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
};


export const doTimeRangeOverlap = (start1: Time, end1: Time, start2: Time, end2: Time) => {
    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);

    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

export const timeToMinutes = (time: Time) => {
    return time.hours * 60 + time.minutes;
};

export const addTime = (time: Time, minutes: number) => {
    const newTime = new Date();

    newTime.setHours(time.hours);
    newTime.setMinutes(time.minutes + minutes);

    return { hours: newTime.getHours(), minutes: newTime.getMinutes() } as Time;
};

export const compareTimes = (time1: Time, time2: Time) => {
    const minutes1 = timeToMinutes(time1);
    const minutes2 = timeToMinutes(time2);

    return minutes1 - minutes2;
};
