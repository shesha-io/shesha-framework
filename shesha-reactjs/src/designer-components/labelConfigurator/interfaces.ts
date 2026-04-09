import { IConfigurableFormComponent } from "@/providers";
import { IRadioOption } from "../settingsInput/interfaces";
import { ComponentDefinition } from "@/interfaces";

export interface ILabelComponentProps extends IConfigurableFormComponent {
  value?: boolean;
  alignPropName?: string;
  labelPropName?: string;
  hideLabelPropName?: string;
  labelAlignOptions?: IRadioOption[];
  placeholder?: string;
}

export interface ILabelComponentCalcProps {
  hideLabel: boolean;
}

export type LabelConfiguratorDefinition = ComponentDefinition<"labelConfigurator", ILabelComponentProps, ILabelComponentCalcProps>;
