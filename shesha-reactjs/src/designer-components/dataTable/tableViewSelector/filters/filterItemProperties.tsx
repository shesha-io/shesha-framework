import React, { FC } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableForm } from '@/components/configurableForm';
import { getFiltersSettingsForm } from './filterItemSettings';
import { useFormViaFactory } from '@/form-factory/hooks';
import { IStoredFilter } from '@/interfaces';

export type BaseFilterProperties = Omit<IStoredFilter, "expression">;

export interface IFilterItemPropertiesProps {
  value?: BaseFilterProperties;
  onChange: (newValue: BaseFilterProperties) => void;
  readOnly: boolean;
}

export const FilterItemProperties: FC<IFilterItemPropertiesProps> = ({ value, onChange, readOnly }) => {
  const debouncedSave = useDebouncedCallback(
    (values: BaseFilterProperties) => {
      onChange({ ...value, ...values });
    },
    // delay in ms
    200,
  );

  const formMarkup = useFormViaFactory(getFiltersSettingsForm);

  return (
    <ConfigurableForm
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      markup={formMarkup}
      initialValues={value}
      onValuesChange={debouncedSave}
    />
  );
};
