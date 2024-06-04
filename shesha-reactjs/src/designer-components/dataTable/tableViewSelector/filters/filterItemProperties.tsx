import { Form } from 'antd';
import React, { FC, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigurableForm } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import tableViewSettingsJson from './filterItemSettings.json';
import { ITableViewProps } from '@/providers/dataTable/filters/models';

export type BaseFilterProperties = Omit<ITableViewProps, "expression">;

export interface IFilterItemPropertiesProps {
  value?: BaseFilterProperties;
  onChange: (newValue: BaseFilterProperties) => void;
  readOnly: boolean;
}

const tableViewSettingsMarkup = tableViewSettingsJson as FormMarkup;

export const FilterItemProperties: FC<IFilterItemPropertiesProps> = ({ value, onChange, readOnly }) => {
  const [form] = Form.useForm();

  const debouncedSave = useDebouncedCallback(
    (values) => {
      onChange({ ...value, ...values });
    },
    // delay in ms
    200
  );

  const editor = useMemo(() => {
    return (<ConfigurableForm
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      markup={tableViewSettingsMarkup}
      form={form}
      initialValues={value}
      onValuesChange={debouncedSave}
    />);
  }, []);

  return (
    <>{editor}</>
  );
};