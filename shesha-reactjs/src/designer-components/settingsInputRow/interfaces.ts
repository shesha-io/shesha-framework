import React from 'react';

import { ComponentDefinition, IConfigurableFormComponent } from "@/interfaces";
import { ISettingsInputProps } from '../settingsInput/interfaces';

export interface IInputRowProps {
  inputs?: Array<ISettingsInputProps>;
  readOnly?: boolean;
  inline?: boolean;
  children?: React.ReactNode;
  hidden?: boolean;
}
export interface ISettingsInputRowProps extends IConfigurableFormComponent, IInputRowProps {
}

export type SettingsInputRowDefinition = ComponentDefinition<"settingsInputRow", ISettingsInputRowProps & IConfigurableFormComponent>;
