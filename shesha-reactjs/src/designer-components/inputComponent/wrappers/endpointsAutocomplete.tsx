import { IEndpointsAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { EndpointsAutocomplete } from '@/components';

export const EndpointsAutocompleteWrapper: FCUnwrapped<IEndpointsAutocompleteSettingsInputProps> = (props) => {
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
