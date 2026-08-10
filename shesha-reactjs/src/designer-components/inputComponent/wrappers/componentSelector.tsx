import { IComponentSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { useMetadataOrUndefined, useShaFormInstance } from '@/providers';
import { FormComponentSelector } from '@/components/formComponentSelector';
import { evaluateString } from '@/providers/form/utils';

export const ComponentSelectorWrapper: FCUnwrapped<IComponentSelectorSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, componentType, propertyAccessor, noSelectionItemText, noSelectionItemValue } = props;

  const { formData } = useShaFormInstance();
  const property = propertyAccessor
    ? evaluateString(propertyAccessor, { data: formData })
    : null;

  const meta = useMetadataOrUndefined();

  const propertyMeta = property && meta
    ? meta.getPropertyMeta(property)
    : undefined;
  return (
    <FormComponentSelector
      value={value}
      onChange={onChange}
      readOnly={readOnly}

      componentType={componentType ?? 'input'}
      noSelectionItem={noSelectionItemText
        ? { label: noSelectionItemText, value: noSelectionItemValue ?? "" }
        : undefined}
      size={size}
      propertyMeta={propertyMeta}
    />
  );
};
