import { IFormItem, IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import { getString, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React from 'react';
import { useForm } from '../../../../providers';

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

  factory: (model: IImageProps) => {
    const { formData } = useForm();

    const url: string = getString(model?.url, formData) || formData?.[model.name];

    return (
      <ConfigurableFormItem model={model}>
        <div className="container">
          <img
            src={url}
            alt="Avatar"
            width={model?.width}
            height={model?.height}
            style={getStyle(model.style, formData)}
          />
        </div>
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    const customModel: IImageProps = {
      ...model,
    };
    return customModel;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default ImageComponent;
