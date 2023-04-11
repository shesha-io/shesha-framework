import { IToolboxComponent } from '../../../../interfaces';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React from 'react';
import { AnnotationSettingsForm } from './settings';
import { useForm } from '../../../../providers';
import { IImageProps } from './model';
import ImageAnnotationControl from './control';
import { Alert } from 'antd';

const ImageAnnotationComponent: IToolboxComponent<IImageProps> = {
  type: 'imageAnnotation',
  name: 'ImageAnnotation',
  icon: <FileImageOutlined />,

  factory: (model: IImageProps) => {
    const { formMode } = useForm();

    if (formMode === 'designer' && !model?.url) {
      return (
        <Alert
          showIcon
          message="ImageAnnotation not configured properly"
          description="Please make sure that you've specified 'url' property."
          type="warning"
        />
      );
    }

    return (
      <ConfigurableFormItem model={model} >
        <ImageAnnotationControl model={model} />
      </ConfigurableFormItem>
    );
  },
  initModel: model => {
    const customModel: IImageProps = {
      ...model,
    };
    return customModel;
  },
  settingsFormMarkup: AnnotationSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(AnnotationSettingsForm, model),
};

export default ImageAnnotationComponent;
