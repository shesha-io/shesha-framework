import { IConfigurableFormComponent } from "@/providers";

export interface ILabelComponentProps extends IConfigurableFormComponent {
    value?: boolean;
    onChange?: Function;
    alignPropName?: string;
    labelPropName?: string;
    hideLabelPropName?: string;
}
