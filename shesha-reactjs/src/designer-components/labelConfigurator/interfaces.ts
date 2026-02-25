import { IConfigurableFormComponent } from "@/providers";
import { IRadioOption } from "../settingsInput/interfaces";
import { ComponentDefinition } from "@/interfaces";

export interface ILabelComponentProps extends IConfigurableFormComponent {
  value?: boolean;
  onChange?: Function;
  alignPropName?: string;
  labelPropName?: string;
  hideLabelPropName?: string;
  labelAlignOptions?: IRadioOption[];
  placeholder?: string;
  metadataValue?: string;
}

export interface IlabelComponentCalcProps {
  hideLabel: boolean;
}

export type LabelConfiguratorDefinition = ComponentDefinition<"labelConfigurator", ILabelComponentProps, IlabelComponentCalcProps>;
