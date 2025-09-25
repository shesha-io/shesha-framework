import { IConfigurableFormComponent } from "@/providers";
import { IRadioOption } from "../settingsInput/interfaces";

export interface ILabelComponentProps extends IConfigurableFormComponent {
  value?: boolean;
  onChange?: Function;
  alignPropName?: string;
  labelPropName?: string;
  hideLabelPropName?: string;
  labelAlignOptions?: IRadioOption[];
}
