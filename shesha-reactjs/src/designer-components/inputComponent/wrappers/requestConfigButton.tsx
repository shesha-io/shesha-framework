import React, { FC } from 'react';
import { IRequestConfigButtonSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { RequestConfigButton } from '@/designer-components/requestConfigButton';
import { IRequestConfig } from '@/components/requestConfigModal';

export const RequestConfigButtonWrapper: FC<IRequestConfigButtonSettingsInputProps> = (props) => {
  return (
    <RequestConfigButton
      {...(props.value !== undefined ? { value: props.value as IRequestConfig } : {})}
      {...(props.onChange !== undefined ? { onChange: props.onChange as (value: IRequestConfig) => void } : {})}
      {...(typeof props.readOnly === 'boolean' ? { readOnly: props.readOnly } : {})}
    />
  );
};
