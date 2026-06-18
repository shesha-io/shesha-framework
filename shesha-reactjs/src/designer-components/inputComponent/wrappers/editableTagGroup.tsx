import { IEditableTagGroupSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { EditableTagGroup } from '@/components/editableTagGroup';

export const EditableTagGroupWrapper: FCUnwrapped<IEditableTagGroupSettingsInputProps> = (props) => {
  const { value, onChange, readOnly } = props;
  return (
    <EditableTagGroup
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};
