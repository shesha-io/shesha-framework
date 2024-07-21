import { IConfigurableFormComponent } from "@/providers";

export interface IBorderValue {
    radius: {
        type: string;
        value: number;
    };
    border: {
        type: string;
        width: {
            value: number | string;
            unit: string;
        };
        color: string;
        style: string;
    };
}

export interface IBorderProps extends IConfigurableFormComponent {
    onChange?: (value: IBorderValue) => void;
    value?: IBorderValue;
}