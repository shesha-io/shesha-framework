function parseIntOrDefault(input: any, defaultValue: number = 0): number {
    const parsed = parseInt(input, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
export { parseIntOrDefault };