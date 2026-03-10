import { IContextPropertyAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useShaFormInstance } from '@/providers';
import { ContextPropertyAutocomplete } from '../../contextPropertyAutocomplete';

export const ContextPropertyAutocompleteWrapper: FC<IContextPropertyAutocompleteSettingsInputProps> = ({ hidden, ...props }) => {
  const { onChange, readOnly } = props;
  // TODO: more to wrapper
  const { formData } = useShaFormInstance();
  return (
    <ContextPropertyAutocomplete
      {...props}
      onValuesChange={onChange}
      readOnly={readOnly}

      style={{}}
      defaultModelType="defaultType"
      id="contextPropertyAutocomplete"
      componentName={formData.componentName}
      propertyName={formData.propertyName}
      contextName={formData.context}
    />
  );
};
