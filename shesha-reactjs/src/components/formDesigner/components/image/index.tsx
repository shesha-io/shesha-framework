import { IFormItem, IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { getString, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React from 'react';
import { StoredFileProvider, useForm, useFormData, useSheshaApplication } from '../../../../providers';
import {
  migrateCustomFunctions,
  migratePropertyName,
} from '../../../../designer-components/_common-migrations/migrateSettings';
import FileView from 'components/fileView';
import { Alert } from 'antd';

export interface IImageProps extends IConfigurableFormComponent, IFormItem {
  height: number | string;
  width: number | string;
  url: string;
  storedFileId: string;
  dataSource?: 'url' | 'storedFileId';
}

const settingsForm = settingsFormJson as FormMarkup;

const ImageComponent: IToolboxComponent<IImageProps> = {
  type: 'image',
  name: 'Image',
  icon: <FileImageOutlined />,

  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { formMode } = useForm();
    const { backendUrl } = useSheshaApplication();

    const hasDimensions = model?.height && model?.width;
    
    if (formMode === 'designer' && !hasDimensions) {
      return (
        <Alert
          showIcon
          message="ImageComponent not configured properly"
          description="Please make sure that you've specified 'height and width' properties."
          type="warning"
        />
      );
    }

    return (
      <ConfigurableFormItem model={model}>
        {(value) => {
          const url: string = getString(model.url, formData);
          const storedFileId: string = getString(model.storedFileId, formData) || (value?.id || value);

          return (
            <StoredFileProvider baseUrl={backendUrl}>
              <FileView
                height={model.height}
                width={model.width}
                dataSource={model.dataSource}
                styles={getStyle(model?.style, formData)}
                url={url}
                storedFileId={storedFileId}
              />
            </StoredFileProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    const customModel: IImageProps = {
      ...model,
    };
    return customModel;
  },
  migrator: (m) => m.add<IImageProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as IImageProps)),
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export default ImageComponent;
