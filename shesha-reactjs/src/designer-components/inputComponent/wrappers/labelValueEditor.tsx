import { LabelValueEditor } from '@/components';
import { defaultExposedVariables } from '@/designer-components/_settings/settingsControl';
import { ILabelValueEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';

export const LabelValueEditorWrapper: FC<ILabelValueEditorSettingsInputProps> = (props) => {
  return <LabelValueEditor {...props} exposedVariables={defaultExposedVariables} />;
};
