import propertySettingsJson from './propertySettings.json';
import React, {
  FC,
} from 'react';
import { ConfigurableForm } from '../../..';
import { Empty } from 'antd';
import { FormMarkup } from '@/providers/form/models';
import { useDebouncedCallback } from 'use-debounce';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { sheshaStyles } from '@/styles';

export interface IModelItemProperties {
  item?: IModelItem;
  onChange?: (item: IModelItem) => void;
}

const formMarkup = propertySettingsJson as FormMarkup;

export const ModelItemProperties: FC<IModelItemProperties> = ({ item, onChange }) => {
  const debouncedSave = useDebouncedCallback(
    (values) => {
      onChange?.({ ...item, ...values });
    },
    // delay in ms
    300,
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
        initialValues={item}
        onValuesChange={debouncedSave}
        className={sheshaStyles.verticalSettingsClass}
      />
    )
    : (
      <div>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Please select a component to begin editing" />
      </div>
    );
};

export default ModelItemProperties;
