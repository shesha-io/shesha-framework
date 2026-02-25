import React, { FC } from 'react';
import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { useDeepCompareMemo } from '@/hooks';
import IconRadioGroup, { IIconRadioGroupValueDefeintion } from '../iconRadioGroup';

export interface IThreeStateSwitchProps {
  value?: boolean | undefined;
  defaultValue?: boolean | undefined;
  readOnly?: boolean;
  onChange?: (value: boolean | undefined) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  yesDefenition?: Partial<IIconRadioGroupValueDefeintion>;
  noDefenition?: Partial<IIconRadioGroupValueDefeintion>;
  defaultDefenition?: Partial<IIconRadioGroupValueDefeintion>;
}

const notRecommendedColor = '#F0F0F0';

const ThreeStateSwitch: FC<IThreeStateSwitchProps> = ({
  yesDefenition: yesValueProp,
  noDefenition: noValueProp,
  defaultDefenition: defaultValueProp,
  defaultValue,
  value,
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

  return <IconRadioGroup {...rest} value={value} valueDefenitions={[yes, no, def]} />;
};

export default ThreeStateSwitch;
