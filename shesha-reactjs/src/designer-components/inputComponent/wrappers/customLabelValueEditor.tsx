import { ICustomLabelValueEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { CustomLabelValueEditorInputs } from '../utils';


export const CustomLabelValueEditorWrapper: FC<ICustomLabelValueEditorSettingsInputProps> = (props) => {
  return <CustomLabelValueEditorInputs {...props} exposedVariables={null} />;
};
