import { LabelValueEditor } from '@/components/labelValueEditor/labelValueEditor';
import { defaultExposedVariables } from '@/designer-components/_settings/settingsControl';
import { ILabelValueEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const LabelValueEditorWrapper: FCUnwrapped<ILabelValueEditorSettingsInputProps> = (props) => {
  return <LabelValueEditor {...props} exposedVariables={defaultExposedVariables} />;
};
