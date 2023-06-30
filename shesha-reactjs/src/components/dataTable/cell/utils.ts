export const asNumber = (value: any): number => {
    return typeof(value) === 'number'
        ? value
        : null;
};