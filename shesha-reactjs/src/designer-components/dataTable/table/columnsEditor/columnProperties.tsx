import React, {
  FC,
  useEffect,
  useMemo,
} from 'react';
import { ConfigurableForm } from '@/components';
import { Form } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { ColumnsItemProps, IDataColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { useDebouncedCallback } from 'use-debounce';
import { sheshaStyles } from '@/styles';
import { usePrevious } from 'react-use';
import { IMetadataContext } from '@/providers/metadata/contexts';
import { getColumnSettings } from './columnSettings';

export interface IColumnPropertiesProps {
  item?: ColumnsItemProps;
  onChange?: (item: ColumnsItemProps) => void;
  readOnly: boolean;
  parentComponentType?: string;
  metadata?: IMetadataContext;
}

export const ColumnProperties: FC<IColumnPropertiesProps> = ({ item, onChange, readOnly, parentComponentType }) => {
  const [form] = Form.useForm();

  const columnType = Form.useWatch('columnType', form);
  const columnSettings = useMemo(() => getColumnSettings({ type: parentComponentType }), [parentComponentType]);

  const prevColumnType = usePrevious(columnType);
  useEffect(() => {
    if (columnType) {
      const fromDataToAction = !['action', 'crud-operations'].includes(prevColumnType) && ['action', 'crud-operations'].includes(columnType);
      const fromActionToData = ['action', 'crud-operations'].includes(prevColumnType) && !['action', 'crud-operations'].includes(columnType);

      if (fromDataToAction) {
        form.setFieldsValue({ minWidth: 35, maxWidth: 35 });
      } else if (fromActionToData) {
        form.setFieldsValue({ minWidth: 100, maxWidth: 0 });
      }
    }
  }, [columnType]);

  const debouncedSave = useDebouncedCallback(
    (values) => {
      onChange?.({ ...item, ...values });
    },
    // delay in ms
    300,
  );

  const linkToModelMetadata = (metadata: IPropertyMetadata): void => {
    if (readOnly) return;
    const values = form.getFieldsValue() as IDataColumnsProps;
    const newValues: IDataColumnsProps = {
      ...values,
      columnType: 'data',
      caption: metadata.label || metadata.path,
      description: metadata.description,
    };
    // TODO: handle editors
    form.setFieldsValue(newValues);
    debouncedSave(newValues);
  };

  return (
    <ConfigurableForm
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      mode={readOnly ? 'readonly' : 'edit'}
      markup={columnSettings as FormMarkup}
      form={form}
      initialValues={item}
      onValuesChange={debouncedSave}
      actions={{
        linkToModelMetadata,
      }}
      className={sheshaStyles.verticalSettingsClass}
    />
  );
};
