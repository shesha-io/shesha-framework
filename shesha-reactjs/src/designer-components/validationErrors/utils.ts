import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: "color", color: '', },
        dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            border: {
                all: {width: "", style: 'solid', color: ''},
                top: {width: "", style: 'solid', color: ''},
                bottom: {width: "", style: 'solid', color: ''},
                left: {width: "", style: 'solid', color: ''},
                right: {width: "", style: 'solid', color: ''},
            },
            // radius: {all: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0},
        },
    };
};