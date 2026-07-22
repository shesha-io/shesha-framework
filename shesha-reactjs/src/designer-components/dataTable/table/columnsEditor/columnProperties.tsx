import React, {
  FC,
  useEffect,
  useMemo,
} from 'react';
import { ConfigurableForm } from '@/components/configurableForm';
import { Form } from 'antd';
import { FormAction, FormMarkup } from '@/providers/form/models';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { useDebouncedCallback } from 'use-debounce';
import { sheshaStyles } from '@/styles';
import { IMetadataContext } from '@/providers/metadata/contexts';
import { getColumnSettings } from './columnSettings';
import { useFormBuilderFactory } from '@/form-factory/hooks';
import { OnFormValuesChangeHandler } from '@/components/configurableForm/models';
import { RecursivePartial } from '@/interfaces/entity';

export interface IColumnPropertiesProps {
  item?: ColumnsItemProps | undefined;
  onChange?: ((item: ColumnsItemProps) => void) | undefined;
  readOnly: boolean;
  parentComponentType?: string | undefined;
  metadata?: IMetadataContext | undefined;
}

export const ColumnProperties: FC<IColumnPropertiesProps> = ({ item, onChange, readOnly, parentComponentType }) => {
  const [form] = Form.useForm<ColumnsItemProps>();
  const fbf = useFormBuilderFactory();

  const columnType = Form.useWatch('columnType', form);
  const columnSettings = useMemo(() => getColumnSettings(fbf, { type: parentComponentType }), [fbf, parentComponentType]);

  const debouncedSave = useDebouncedCallback<OnFormValuesChangeHandler<ColumnsItemProps>>(
    (_, values) => {
      onChange?.({ ...item, ...values });
    },
    // delay in ms
    300,
  );

  useEffect(() => {
    if (!columnType || readOnly) return;

    const { minWidth } = form.getFieldsValue();
    // The width is considered not configured when it still holds one of the automatic
    // defaults: 100px for data columns or 35px for action/crud-operations columns.
    const isWidthConfigured = typeof minWidth === 'number' && minWidth !== 100 && minWidth !== 35;
    if (isWidthConfigured) return;

    const isActionColumn = ['action', 'crud-operations'].includes(columnType);
    const widths = isActionColumn ? { minWidth: 35, maxWidth: 35 } : { minWidth: 100, maxWidth: 0 };
    form.setFieldsValue(widths);
    const values = form.getFieldsValue();
    debouncedSave(values, values);
  }, [columnType, form, readOnly, debouncedSave]);

  const linkToModelMetadata = (metadata: IPropertyMetadata): void => {
    if (readOnly) return;
    const values = form.getFieldsValue();

    const newValues: ColumnsItemProps = {
      ...values,
      columnType: 'data',
      caption: metadata.label || metadata.path,
      description: metadata.description ?? undefined,
      permissions: values.permissions ?? [],
    };
    form.setFieldsValue(newValues as RecursivePartial<ColumnsItemProps>);
    debouncedSave(newValues, newValues);
  };

  return (
    <ConfigurableForm<ColumnsItemProps>
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      markup={columnSettings as FormMarkup}
      form={form}
      initialValues={item}
      onValuesChange={debouncedSave}
      actions={{
        linkToModelMetadata: linkToModelMetadata as FormAction,
      }}
      className={sheshaStyles.verticalSettingsClass}
    />
  );
};
