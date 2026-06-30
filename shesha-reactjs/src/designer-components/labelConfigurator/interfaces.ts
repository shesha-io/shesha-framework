import { IConfigurableFormComponent } from "@/providers";
import { IRadioOption } from "../settingsInput/interfaces";
import { ComponentDefinition } from "@/interfaces";

export interface ILabelComponentProps extends IConfigurableFormComponent {
  alignPropName?: string | undefined;
  labelPropName?: string | undefined;
  hideLabelPropName?: string | undefined;
  labelAlignOptions?: IRadioOption[] | undefined;
  placeholder?: string | undefined;
}

export interface ILabelComponentCalcProps {
  hideLabel: boolean;
}

export type LabelConfiguratorDefinition = ComponentDefinition<"labelConfigurator", ILabelComponentProps, ILabelComponentCalcProps>;
