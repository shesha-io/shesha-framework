import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
        dimensions: {
            width: '100%',
            height: '500px',
            minHeight: 'auto',
            maxHeight: 'auto',
            minWidth: 'auto',
            maxWidth: 'auto',
        },
    };
};