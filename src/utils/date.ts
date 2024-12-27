export const convertDateFormat = (date: string) => {
    const [day, month, year] = date.split('/');

    return `${year}-${month}-${day}`;
};

export const doTimeRangeOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);

        return hours * 60 + minutes;
    }

    const start1Minutes = timeToMinutes(start1);
    const end1Minutes = timeToMinutes(end1);
    const start2Minutes = timeToMinutes(start2);
    const end2Minutes = timeToMinutes(end2);

    return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};
