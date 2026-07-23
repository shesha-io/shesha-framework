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

  // Track whether the column is an action column so we only reset widths when the type
  // actually crosses the data <-> action boundary. `undefined` means "not seen yet" so the
  // first run (loading an existing column) never overwrites the user's saved widths.
  useEffect(() => {
    if (!columnType || readOnly) return;

    const isActionColumn = ['action', 'crud-operations'].includes(columnType);
    const currentValues = form.getFieldsValue(['minWidth', 'maxWidth']) as Pick<ColumnsItemProps, 'minWidth' | 'maxWidth'>;

    // Determine default widths based on column type
    const defaultWidths = isActionColumn
      ? { minWidth: 35, maxWidth: 35 }
      : { minWidth: 100, maxWidth: 0 };

    // Check if column has custom width configuration
    // A column is considered configured if either width differs from its default
    const hasCustomMinWidth = currentValues.minWidth !== undefined &&
      currentValues.minWidth !== (isActionColumn ? 35 : 100);
    const hasCustomMaxWidth = currentValues.maxWidth !== undefined &&
      currentValues.maxWidth !== (isActionColumn ? 35 : 0);

    // Only update widths if column is not configured
    if (!hasCustomMinWidth && !hasCustomMaxWidth) {
      form.setFieldsValue(defaultWidths);
      const values = form.getFieldsValue();
      debouncedSave(values, values);
    }
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
