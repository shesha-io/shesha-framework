export const messageApiDefinition = `
export interface MessageType extends PromiseLike<boolean> {
    (): void;
}

export type TypeOpen = (content: string, duration?: number | VoidFunction, onClose?: VoidFunction) => MessageType;

export type MessageApi = {
    info: TypeOpen;
    success: TypeOpen;
    warning: TypeOpen;
    error: TypeOpen;
};`;
