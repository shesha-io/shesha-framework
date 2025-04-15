import { IConfigurableFormComponent } from "@/providers";

type IBorderType = "dashed" | "dotted" | "none" | "solid";
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
            style?: IBorderType;
        };
        top?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: IBorderType;
        };
        right?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: IBorderType;
        };
        bottom?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: IBorderType;
        };
        left?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: IBorderType;
        };
        middle?: {
            width?: string | number;
            unit?: string;
            color?: string;
            style?: IBorderType;
        };
    };
    radiusType?: string;
    borderType?: string;
    hideBorder?: boolean;
}

export interface IBorderProps extends IConfigurableFormComponent {
    onChange?: (value: IBorderValue) => void;
    value?: IBorderValue;
}