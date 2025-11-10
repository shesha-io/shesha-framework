import { IKeyInformationBarColumnsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import KeyInformationBarColumnsList from '../../keyInformationBar/columnsList';

export const KeyInformationBarColumnsWrapper: FC<IKeyInformationBarColumnsInputProps> = (props) => {
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
