import { IToolboxComponent } from '../../../../interfaces';
import { LineOutlined } from '@ant-design/icons';
import React from 'react';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData } from '../../../../providers';
import SectionSeparator from '../../../sectionSeparator';
import { ISectionSeparatorComponentProps } from './interfaces';
import { getSettings } from './settings';

const SectionSeparatorComponent: IToolboxComponent<ISectionSeparatorComponentProps> = {
  type: 'sectionSeparator',
  name: 'Section Separator',
  icon: <LineOutlined />,
  factory: (model: ISectionSeparatorComponentProps) => {
    const { isComponentHidden } = useForm();
    const { data: formData } = useFormData();

    if (isComponentHidden(model)) return null;

    return (
      <SectionSeparator
        title={model.label}
        containerStyle={getStyle(model?.containerStyle, formData)}
        titleStyle={getStyle(model?.titleStyle, formData)}
        tooltip={model?.description}
      />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: (model) => {
    return {
      ...model,
      label: 'Section',
    };
  },
};

export default SectionSeparatorComponent;
