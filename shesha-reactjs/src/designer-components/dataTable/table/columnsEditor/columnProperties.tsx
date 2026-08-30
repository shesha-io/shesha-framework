import { FC, useEffect, useMemo } from 'react';
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
import { usePrevious } from '@/hooks';
import { useShaFormRef } from '@/providers/form/providers/shaFormProvider';
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
  const shaFormRef = useShaFormRef<ColumnsItemProps>();
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

  const prevColumnType = usePrevious(columnType);
  // Reset widths only when the type actually crosses the data <-> action boundary;
  // the first run (loading an existing column) never overwrites the saved widths.
  useEffect(() => {
    if (readOnly || columnType === undefined || prevColumnType === undefined || prevColumnType === null || columnType === prevColumnType) return;

    const isActionType = (type: string): boolean => ['action', 'crud-operations'].includes(type);
    if (isActionType(columnType) === isActionType(prevColumnType)) return;

    const defaultWidths = isActionType(columnType)
      ? { minWidth: 35, maxWidth: 35 }
      : { minWidth: 100, maxWidth: 0 };
    // go through the shaForm so its formData is updated too — the width fields live on the
    // Appearance tab and antd setFieldsValue alone leaves stale widths in formData, which the
    // next field change would save back over the reset
    const shaForm = shaFormRef.current;
    const base = shaForm?.formData ?? item;
    if (!shaForm || !base) return;
    shaForm.setFormData({ values: { ...base, ...defaultWidths }, mergeValues: true });
  }, [columnType, prevColumnType, shaFormRef, item, readOnly]);

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
      shaFormRef={shaFormRef}
      initialValues={item}
      onValuesChange={debouncedSave}
      actions={{
        linkToModelMetadata: linkToModelMetadata as FormAction,
      }}
      className={sheshaStyles.verticalSettingsClass}
    />
  );
};
