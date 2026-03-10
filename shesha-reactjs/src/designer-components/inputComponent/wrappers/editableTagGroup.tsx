import { IEditableTagGroupSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { EditableTagGroup } from '@/components';

export const EditableTagGroupWrapper: FC<IEditableTagGroupSettingsInputProps> = (props) => {
  const { value, onChange, readOnly } = props;
  return (
    <EditableTagGroup
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};
