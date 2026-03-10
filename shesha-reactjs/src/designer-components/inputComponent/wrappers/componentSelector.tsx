import { IComponentSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { useMetadata, useShaFormInstance } from '@/providers';
import { FormComponentSelector } from '@/components';
import { evaluateString } from '@/providers/form/utils';

export const ComponentSelectorWrapper: FC<IComponentSelectorSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, componentType, propertyAccessor, noSelectionItemText, noSelectionItemValue } = props;

  const { formData } = useShaFormInstance();
  const property = propertyAccessor
    ? evaluateString(propertyAccessor, { data: formData })
    : null;

  const meta = useMetadata(false);

  const propertyMeta = property && meta
    ? meta.getPropertyMeta(property)
    : null;
  return (
    <FormComponentSelector
      value={value}
      onChange={onChange}
      readOnly={readOnly}

      componentType={componentType}
      noSelectionItem={noSelectionItemText ? { label: noSelectionItemText, value: noSelectionItemValue } : undefined}
      size={size}
      propertyMeta={propertyMeta}
    />
  );
};
