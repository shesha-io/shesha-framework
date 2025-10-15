import { IToolboxComponent } from '@/interfaces';
import { FileImageOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import React from 'react';
import { AnnotationSettingsForm } from './settings';
import { useForm } from '@/providers';
import { IImageProps } from './model';
import ImageAnnotationControl from './control';
import { Alert } from 'antd';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const ImageAnnotationComponent: IToolboxComponent<IImageProps> = {
  type: 'imageAnnotation',
  name: 'ImageAnnotation',
  icon: <FileImageOutlined />,
  isInput: true,
  isOutput: true,

  Factory: ({ model }) => {
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
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <ImageAnnotationControl model={model} value={value} onChange={onChange} />}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<IImageProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IImageProps)
    .add<IImageProps>(1, (prev) => migrateVisibility(prev))
    .add<IImageProps>(2, (prev) => migrateReadOnly(prev))
    .add<IImageProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) })),
  initModel: (model) => {
    const customModel: IImageProps = {
      ...model,
    };
    return customModel;
  },
  settingsFormMarkup: AnnotationSettingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(AnnotationSettingsForm, model),
};

export default ImageAnnotationComponent;
