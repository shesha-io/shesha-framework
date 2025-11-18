import React from 'react';

import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
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

export type SettingsInputRowDefinition = IToolboxComponent<ISettingsInputRowProps & IConfigurableFormComponent>;
