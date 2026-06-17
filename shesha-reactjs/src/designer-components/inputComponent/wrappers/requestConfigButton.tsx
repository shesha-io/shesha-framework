import React, { FC } from 'react';
import { IRequestConfigButtonSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { RequestConfigButton } from '@/designer-components/requestConfigButton';

export const RequestConfigButtonWrapper: FC<IRequestConfigButtonSettingsInputProps> = (props) => {
  return (
    <RequestConfigButton
      value={props.value}
      onChange={props.onChange}
      readOnly={props.readOnly}
    />
  );
};
