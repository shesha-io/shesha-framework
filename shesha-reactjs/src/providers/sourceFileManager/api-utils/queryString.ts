export const queryStringValuesDefinition = `
export interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}`;
