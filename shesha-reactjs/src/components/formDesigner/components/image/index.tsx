import { IFormItem, IToolboxComponent } from 'interfaces';
import { FormMarkup, IConfigurableFormComponent } from 'providers/form/models';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { getString, getStyle, validateConfigurableComponentSettings } from 'providers/form/utils';
import React from 'react';
import { useFormData } from 'providers';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from 'designer-components/_common-migrations/migrateVisibility';

export interface IImageProps extends IConfigurableFormComponent, IFormItem {
  height: number | string;
  width: number | string;
  url: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const ImageComponent: IToolboxComponent<IImageProps> = {
  type: 'image',
  name: 'Image',
  icon: <FileImageOutlined />,

  Factory: ({ model }) => {
    const { data: formData } = useFormData();

    return (
      <ConfigurableFormItem model={model}>
        {(value) => {
          // TODO:: Update the settings such that an option in the settings is added so allow the form to pass url through value.
          // TODO:: Add ImgWrapper component
          const url: string = getString(model?.url, formData) || value;

          return (
            <div className="container">
              <img
                src={url}
                alt="Avatar"
                width={model?.width}
                height={model?.height}
                style={getStyle(model.style, formData)}
              />
            </div>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    const customModel: IImageProps = {
      ...model,
    };
    return customModel;
  },
  migrator: (m) => m
    .add<IImageProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev) as IImageProps))
    .add<IImageProps>(1, (prev) => migrateVisibility(prev))
  ,
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default ImageComponent;
