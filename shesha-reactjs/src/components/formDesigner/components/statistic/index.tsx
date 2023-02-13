import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { BarChartOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import ShaStatistic, { IShaStatisticProps } from '../../../statistic';
import ShaIcon from '../../../shaIcon';
import { useForm } from '../../../../providers';
import _ from 'lodash';

const settingsForm = settingsFormJson as FormMarkup;

interface IStatisticComponentProps
  extends Omit<IShaStatisticProps, 'style' | 'valueStyle'>,
    IConfigurableFormComponent {
  valueStyle?: string;
}

const StatisticComponent: IToolboxComponent<IStatisticComponentProps> = {
  type: 'statistic',
  name: 'Statistic',
  icon: <BarChartOutlined />,
  factory: ({ style, valueStyle, ...model }: IStatisticComponentProps) => {
    const { prefix, suffix, name } = model;
    const { formData } = useForm();

    const getDisplayValue = (prop: string) => {
      if (!formData || !prop) return undefined;

      const value = _.get(formData, model?.name);

      return typeof value === 'object' ? null : _.get(formData, model?.name);
    };

    return (
      <ShaStatistic
        {...model}
        value={getDisplayValue(name)}
        prefix={prefix ? <ShaIcon iconName={prefix as any} /> : null}
        suffix={suffix ? <ShaIcon iconName={suffix as any} /> : null}
        style={getStyle(style, formData)}
        valueStyle={getStyle(valueStyle, formData)}
      />
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default StatisticComponent;
