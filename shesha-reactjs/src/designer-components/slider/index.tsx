import { Slider } from 'antd';
import React from 'react';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { IToolboxComponent } from '@/interfaces';
import { useFormData } from '@/providers';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { SlidersFilled } from '@ant-design/icons';
import { ISliderComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

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
      <ConfigurableFormItem model={model} initialValue={defaultValue}>
        {(value, onChange) => (
          <Slider
            className="sha-slider"
            defaultValue={defaultValue}
            min={min}
            max={max}
            onChange={onChange}
            value={value}
            style={{ ...(!model.enableStyleOnReadonly && model.readOnly
              ? {} : getStyle(model?.style, formData)), ...(model.readOnly
              ? { pointerEvents: 'none' } : {}) }}
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
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default SwitchComponent;
