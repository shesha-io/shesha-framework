import { ISliderSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FCUnwrapped } from '@/providers/form/models';
import { Slider } from 'antd';
import { isDefined } from '@/utils/nullables';

export const SliderWrapper: FCUnwrapped<ISliderSettingsInputProps> = (props) => {
  const { value, onChange, readOnly = false, min, max, step } = props;
  return (
    <Slider
      {...(isDefined(value) ? { value } : {})}
      onChange={(newValue: number) => onChange?.(newValue)}
      disabled={readOnly}
      {...(isDefined(min) ? { min } : {})}
      {...(isDefined(max) ? { max } : {})}
      {...(isDefined(step) ? { step } : {})}
    />
  );
};
