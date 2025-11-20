import React, { FC, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableForm } from '@/components';
import { ITableViewProps } from '@/providers/dataTable/filters/models';
import { getFiltersSettingsForm } from './filterItemSettings';
import { useFormViaFactory } from '@/form-factory/hooks';

export type BaseFilterProperties = Omit<ITableViewProps, "expression">;

export interface IFilterItemPropertiesProps {
  value?: BaseFilterProperties;
  onChange: (newValue: BaseFilterProperties) => void;
  readOnly: boolean;
}

export const FilterItemProperties: FC<IFilterItemPropertiesProps> = ({ value, onChange, readOnly }) => {
  const debouncedSave = useDebouncedCallback(
    (values) => {
      onChange({ ...value, ...values });
    },
    // delay in ms
    200,
  );

  const formMarkup = useFormViaFactory(getFiltersSettingsForm);

  const editor = useMemo(() => {
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
  }, []);

  return (
    <>{editor}</>
  );
};
