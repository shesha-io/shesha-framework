export const fileSaverApiDefinition = `
export interface FileSaverType {
    (): void;
}

export type TFileSaver = (data: object | string, filename?: string, options?: object) => void;

export type FileSaverApi = {
    saveAs: TFileSaver;
};`;
