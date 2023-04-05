import { IToolboxComponent } from '../../../../interfaces';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import React, { useEffect, useState } from 'react';
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
    const { validate } = model;
    const [isRequired, setIsRequired] = useState(validate?.required);

    useEffect(() => {
      model.validate.required = isRequired;
    }, [isRequired]);

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
      <ConfigurableFormItem model={model}>
        <ImageAnnotationControl model={model} setIsRequired={setIsRequired} isRequired={isRequired} />
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
