import { Slider } from 'antd';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import { useFormData } from '@/providers';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { SlidersFilled } from '@ant-design/icons';
import { ISliderComponentProps } from './interfaces';
import { settingsFormMarkup } from './settings';

const SwitchComponent: IToolboxComponent<ISliderComponentProps> = {
  type: 'slider',
  name: 'Slider',
  icon: <SlidersFilled />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();

    const defaultValue = model?.defaultValue ? parseInt(model.defaultValue, 10) : undefined;
    const min = model?.min ? parseInt(model.min, 10) : undefined;
    const max = model?.max ? parseInt(model.max, 10) : undefined;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (
          <Slider
            className="sha-slider"
            defaultValue={defaultValue}
            min={min}
            max={max}
            disabled={model.readOnly}
            onChange={onChange}
            value={value}
            style={getStyle(model?.style, formData)}
          />
        )}
      </ConfigurableFormItem>
    );
  },
  initModel: (model) => {
    return {
      ...model,
      label: 'Slider',
    };
  },
  settingsFormMarkup,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsFormMarkup, model),
};

export default SwitchComponent;
