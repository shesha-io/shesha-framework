import React, { FC } from 'react';
import { IRequestConfigButtonSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { RequestConfigButton } from '@/designer-components/requestConfigButton';
import { IRequestConfig } from '@/components/requestConfigModal';

const isIRequestConfig = (v: unknown): v is IRequestConfig =>
  typeof v === 'object' && v !== null &&
  Array.isArray((v as IRequestConfig).params) &&
  Array.isArray((v as IRequestConfig).headers) &&
  typeof (v as IRequestConfig).body === 'object';

export const RequestConfigButtonWrapper: FC<IRequestConfigButtonSettingsInputProps> = (props) => {
  return (
    <RequestConfigButton
      {...(isIRequestConfig(props.value) ? { value: props.value } : {})}
      onChange={(v: IRequestConfig) => props.onChange?.(v)}
      {...(typeof props.readOnly === 'boolean' ? { readOnly: props.readOnly } : {})}
    />
  );
};
