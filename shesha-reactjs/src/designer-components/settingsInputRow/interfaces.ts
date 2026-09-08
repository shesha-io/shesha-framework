import * as React from 'react';

import { ComponentDefinition, IConfigurableFormComponent } from "@/interfaces";
import { ISettingsInputProps } from '../settingsInput/interfaces';

export interface IInputRowProps extends Pick<IConfigurableFormComponent, "hidden"> {
  inputs?: Array<ISettingsInputProps> | undefined;
  readOnly?: boolean | undefined;
  inline?: boolean | undefined;
  children?: React.ReactNode | undefined;
}
export interface ISettingsInputRowProps extends IConfigurableFormComponent, Omit<IInputRowProps, "readOnly"> {
}

export type SettingsInputRowDefinition = ComponentDefinition<"settingsInputRow", ISettingsInputRowProps & IConfigurableFormComponent>;
