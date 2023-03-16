function parseIntOrDefault(input: any, defaultValue: number = 0): number {
    const parsed = parseInt(input, 0);
    return isNaN(parsed) ? defaultValue : parsed;
}
export { parseIntOrDefault };