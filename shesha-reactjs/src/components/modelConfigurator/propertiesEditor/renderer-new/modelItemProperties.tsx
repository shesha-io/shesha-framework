import propertySettingsJson from './propertySettings.json';
import React, {
  FC,
} from 'react';
import { ConfigurableForm } from '../../..';
import { Empty, Form } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { IModelItem } from '@/interfaces/modelConfigurator';

export interface IModelItemProperties {
  item?: IModelItem;
  onChange?: (item: IModelItem) => void;
}

const formMarkup = propertySettingsJson as FormMarkup;

export const ModelItemProperties: FC<IModelItemProperties> = ({ item, onChange }) => {
  const [form] = Form.useForm();

  const debouncedSave = useDebouncedCallback(
    values => {
      onChange?.({ ...item, ...values });
    },
    // delay in ms
    300
  );

  return item
    ? (
      <ConfigurableForm
        size="small"
        layout="horizontal"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        mode="edit"
        markup={formMarkup}
        form={form}
        initialValues={item}
        onValuesChange={debouncedSave}
        className='vertical-settings'
      />
    )
    : (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a component to begin editing" />
      </div >
    );
};

export default ModelItemProperties;
