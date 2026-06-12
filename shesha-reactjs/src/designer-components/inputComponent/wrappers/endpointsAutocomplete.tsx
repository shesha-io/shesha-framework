import { IEndpointsAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { EndpointsAutocomplete } from '@/components/endpointsAutocomplete/endpointsAutocomplete';
import { useShaFormInstance } from '@/providers';
import { evaluateValueAsString } from '@/providers/form/utils';

export const EndpointsAutocompleteWrapper: FCUnwrapped<IEndpointsAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, size, httpVerb } = props;
  const { formData } = useShaFormInstance();

  const resolvedHttpVerb = httpVerb
    ? evaluateValueAsString(httpVerb, { data: formData }) ?? httpVerb
    : httpVerb;

  return (
    <EndpointsAutocomplete
      {...props} // TODO: check spread
      // mode={props.mode}
      size={size}
      httpVerb={resolvedHttpVerb}
      value={value}
      onChange={onChange}
    />
  );
};
