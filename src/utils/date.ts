export const convertDateFormat = (date: string) => {
    const [day, month, year] = date.split('/');

    return `${month}/${day}/${year}`;
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

export const isValideDate = (date: string) => {
    const parts = date.split('/').map(Number);

    if (parts.length !== 3) {
        return false;
    }

    parts[1] -= 1; // Month is 0-based

    if (isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) { // Check if parts are numbers
        return false;
    }

    const dateObj = new Date(parts[2], parts[1], parts[0]);

    return dateObj.getDate() === parts[0] && dateObj.getMonth() === parts[1] && dateObj.getFullYear() === parts[2]; // Check if date is valid
}

export const isValideTime = (time: string) => {
    const parts = time.split(':').map(Number);

    if (parts.length !== 2) {
        return false;
    }

    if (isNaN(parts[0]) || isNaN(parts[1])) {
        return false;
    }

    return parts[0] >= 0 && parts[0] <= 23 && parts[1] >= 0 && parts[1] <= 59;
};
