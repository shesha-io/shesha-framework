import { IConfigurableFormComponent } from "@/providers";

export interface IBorderValue {
    radius?: {
        all?: number;
        topLeft?: number;
        topRight?: number;
        bottomLeft?: number;
        bottomRight?: number;
    };
    border?: {
        all: {
            width?: string;
            color?: string;
            style?: string;
        };
        top?: {
            width?: string;
            unit?: string;
            color?: string;
            style?: string;
        };
        right?: {
            width?: string;
            unit?: string;
            color?: string;
            style?: string;
        };
        bottom?: {
            width?: string;
            unit?: string;
            color?: string;
            style?: string;
        };
        left?: {
            width?: string;
            unit?: string;
            color?: string;
            style?: string;
        };
    };
    selectedCorner?: string;
    selectedSide?: string;
    hideBorder?: boolean;
}

export interface IBorderProps extends IConfigurableFormComponent {
    onChange?: (value: IBorderValue) => void;
    value?: IBorderValue;
}