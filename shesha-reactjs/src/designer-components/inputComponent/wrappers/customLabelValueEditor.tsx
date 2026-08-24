import { ICustomLabelValueEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FCUnwrapped } from '@/providers/form/models';
import { CustomLabelValueEditorInputs } from '../utils';


export const CustomLabelValueEditorWrapper: FCUnwrapped<ICustomLabelValueEditorSettingsInputProps> = (props) => {
  return <CustomLabelValueEditorInputs {...props} />;
};
