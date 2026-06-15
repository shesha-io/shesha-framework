import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { IRequestConfigButtonSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { RequestConfigButton } from '@/designer-components/requestConfigButton';

export const RequestConfigButtonWrapper: FCUnwrapped<IRequestConfigButtonSettingsInputProps> = (props) => {
  return (
    <RequestConfigButton
      value={props.value}
      onChange={props.onChange}
      readOnly={props.readOnly}
    />
  );
};
