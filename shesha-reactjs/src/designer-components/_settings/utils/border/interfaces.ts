import { IConfigurableFormComponent } from "@/providers";

export interface IBorderValue {
    radius?: {
        all?: string | number;
        topLeft?: string | number;
        topRight?: string | number;
        bottomLeft?: string | number;
        bottomRight?: string | number;
    };
    border?: {
        all?: {
            width?: string | number;
            color?: string;
            style?: string;
        };
        top?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: string;
        };
        right?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: string;
        };
        bottom?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: string;
        };
        left?: {
            width?: string | number;
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