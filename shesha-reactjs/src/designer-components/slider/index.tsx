import { Slider } from 'antd';
import React from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { useFormData } from '@/providers';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { SlidersFilled } from '@ant-design/icons';
import { ISliderComponentProps, ISliderComponentPropsV0, SliderComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';
import { useStyles } from './styles';
import { DataTypes } from '@/interfaces';
import { NumberFormats } from '@/interfaces/dataTypes';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

const SliderComponent: SliderComponentDefinition = {
  type: 'slider',
  name: 'Slider',
  icon: <SlidersFilled />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.number && !isNullOrWhiteSpace(dataFormat) && [NumberFormats.int64, NumberFormats.int32].includes(dataFormat),
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { styles } = useStyles();

    return (
      <div className={styles.sliderWrapper}>
        <ConfigurableFormItem<number> model={model}>
          {(value, onChange) => (
            <Slider
              range={false}
              className="sha-slider"
              {...(isDefined(model.min) ? { min: model.min } : {})}
              {...(isDefined(model.max) ? { min: model.max } : {})}
              onChange={(newValue) => onChange(newValue)}
              {...(isDefined(value) ? { value } : {})}
              style={{ ...(!model.enableStyleOnReadonly && model.readOnly
                ? {} : getStyle(model.style, formData)), ...(model.readOnly
                ? { pointerEvents: 'none' } : {}) }}
            />
          )}
        </ConfigurableFormItem>
      </div>
    );
  },
  initModel: (model) => {
    return {
      ...model,
      label: 'Slider',
    };
  },
  settingsFormMarkup: getSettings,
  linkToModelMetadata: (model, propMetadata) => ({ ...model, min: propMetadata.min ?? undefined, max: propMetadata.max ?? undefined }),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m.add<ISliderComponentPropsV0>(0, (prev) => ({ ...prev }))
      .add<ISliderComponentProps>(1, (prev) => ({
        ...prev,
        min: prev.min && prev.min !== '' ? parseInt(prev.min, 10) : undefined,
        max: prev.max && prev.max !== '' ? parseInt(prev.max, 10) : undefined,
      })),
};

export default SliderComponent;
