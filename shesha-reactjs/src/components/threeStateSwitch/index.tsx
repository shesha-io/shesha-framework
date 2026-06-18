import React, { FC } from 'react';
import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { useDeepCompareMemo } from '@/hooks';
import IconRadioGroup, { IIconRadioGroupValueDefinition } from '../iconRadioGroup';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IThreeStateSwitchProps {
  value?: boolean | undefined;
  defaultValue?: boolean | undefined;
  readOnly?: boolean | undefined;
  onChange?: ((value: boolean | null) => void) | undefined;
  size?: SizeType | undefined;
  className?: string | undefined;
  yesDefinition?: Partial<IIconRadioGroupValueDefinition> | undefined;
  noDefinition?: Partial<IIconRadioGroupValueDefinition> | undefined;
  defaultDefinition?: Partial<IIconRadioGroupValueDefinition> | undefined;
}

const notRecommendedColor = '#F0F0F0';

const ThreeStateSwitch: FC<IThreeStateSwitchProps> = ({
  yesDefinition: yesValueProp,
  noDefinition: noValueProp,
  defaultDefinition: defaultValueProp,
  defaultValue,
  value,
  onChange,
  ...rest
}) => {
  const yes = useDeepCompareMemo(() => {
    return {
      ...{
        value: true,
        icon: <CheckOutlined />,
        hint: `Yes${defaultValue === true ? ' (Default for Metadata)' : defaultValue === false ? ' (Not recommended for Metadata)' : ''}`,
        style: defaultValue === false && value !== true ? { backgroundColor: notRecommendedColor } : undefined,
      },
      ...yesValueProp,
    };
  }, [yesValueProp, defaultValue, value]);

  const no = useDeepCompareMemo(() => {
    return {
      ...{
        value: false,
        icon: <CloseOutlined />,
        hint: `No${defaultValue === false ? ' (Default for Metadata)' : defaultValue === true ? ' (Not recommended for Metadata)' : ''}`,
        style: defaultValue === true && value !== false ? { backgroundColor: notRecommendedColor } : undefined,
      },
      ...noValueProp,
    };
  }, [noValueProp, defaultValue, value]);

  const def = useDeepCompareMemo(() => {
    return { ...{ value: undefined, icon: <SettingOutlined />, hint: `Default${defaultValue === true ? ' (Yes)' : defaultValue === false ? ' (No)' : ''}` }, ...defaultValueProp };
  }, [defaultValueProp, defaultValue]);

  return (
    <IconRadioGroup
      {...rest}
      value={value}
      onChange={(newValue) => {
        onChange?.(newValue ?? null);
      }}
      valueDefinitions={[yes, no, def]}
    />
  );
};

export default ThreeStateSwitch;
