import React, { FC } from 'react';
import { CheckOutlined, CloseOutlined, QuestionOutlined } from '@ant-design/icons';
import { useDeepCompareMemo } from '@/hooks';
import IconRadioGroup, { IIconRadioGroupValue } from '../iconRadioGroup';

export interface IThreeStateSwitchProps {
  value?: boolean | undefined;
  readOnly?: boolean;
  onChange?: (value: boolean | undefined) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  yesValue?: Partial<IIconRadioGroupValue>;
  noValue?: Partial<IIconRadioGroupValue>;
  defaultValue?: Partial<IIconRadioGroupValue>;
}
const ThreeStateSwitch: FC<IThreeStateSwitchProps> = ({
  yesValue: yesValueProp,
  noValue: noValueProp,
  defaultValue: defaultValueProp,
  ...rest
}) => {
  const yesValue = useDeepCompareMemo(() => {
    return { ...{ value: true, icon: <CheckOutlined />, hint: "Yes" }, ...yesValueProp };
  }, [yesValueProp]);

  const noValue = useDeepCompareMemo(() => {
    return { ...{ value: false, icon: <CloseOutlined />, hint: "No" }, ...noValueProp };
  }, [noValueProp]);

  const defaultValue = useDeepCompareMemo(() => {
    return { ...{ value: undefined, icon: <QuestionOutlined />, hint: "Default" }, ...defaultValueProp };
  }, [defaultValueProp]);

  return <IconRadioGroup {...rest} values={[yesValue, noValue, defaultValue]} />;
};

export default ThreeStateSwitch;
