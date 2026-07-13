import React from 'react';

import { ComponentDefinition, IConfigurableFormComponent } from "@/interfaces";
import { ISettingsInputProps } from '../settingsInput/interfaces';

export interface IInputRowProps {
  inputs?: Array<ISettingsInputProps> | undefined;
  readOnly?: boolean | undefined;
  inline?: boolean | undefined;
  children?: React.ReactNode | undefined;
  hidden?: boolean | undefined;
}
export interface ISettingsInputRowProps extends IConfigurableFormComponent, Omit<IInputRowProps, "readOnly"> {
}

export type SettingsInputRowDefinition = ComponentDefinition<"settingsInputRow", ISettingsInputRowProps & IConfigurableFormComponent>;
