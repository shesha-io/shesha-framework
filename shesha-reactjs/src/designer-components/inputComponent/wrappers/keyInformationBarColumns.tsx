import { IKeyInformationBarColumnsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import KeyInformationBarColumnsList from '../../keyInformationBar/columnsList';

export const KeyInformationBarColumnsWrapper: FCUnwrapped<IKeyInformationBarColumnsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  return (
    <KeyInformationBarColumnsList
      {...props}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
    />
  );
};
