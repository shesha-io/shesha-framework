import { IEndpointsAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { EndpointsAutocomplete } from '@/components';

export const EndpointsAutocompleteWrapper: FC<IEndpointsAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, size, httpVerb } = props;
  return (
    <EndpointsAutocomplete
      {...props} // TODO: check spread
      // mode={props.mode}
      size={size}
      httpVerb={httpVerb}
      value={value}
      onChange={onChange}
    />
  );
};
