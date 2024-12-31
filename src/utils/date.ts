export const convertDateStringDDMMYYYYToDate = (date: string) => {
    const [day, month, year] = date.split('/').map(Number);

    return new Date(year, month - 1, day);
};

export const convertDateStringMMDDYYYYToDate = (date: string) => {
    const [month, day, year] = date.split('/').map(Number);

    return new Date(year, month - 1, day);
};

export const convertDateToDateStringDDMMYYYY = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

export const convertDateToDateStringMMDDYYYY = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
};

export const isValidStringDate = (date: string) => {
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

