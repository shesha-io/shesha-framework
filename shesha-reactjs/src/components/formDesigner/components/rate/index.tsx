import { LikeOutlined, StarFilled } from '@ant-design/icons';
import { message, Rate } from 'antd';
import React from 'react';
import {
  axiosHttp,
  ConfigurableFormItem,
  IConfigurableFormComponent,
  IToolboxComponent,
  ShaIcon,
  useForm,
  useGlobalState,
  useSheshaApplication,
  validateConfigurableComponentSettings,
} from '../../../..';
import { getStyle } from '../../../../providers/form/utils';
import { IconType } from '../../../shaIcon';
import { getSettings } from './settings';
import moment from 'moment';
import { customRateEventHandler } from '../utils';
import _ from 'lodash';

export interface IRateProps extends IConfigurableFormComponent {
  value?: number;
  defaultValue?: number;
  allowClear?: boolean;
  allowHalf?: boolean;
  icon?: string;
  disabled?: boolean;
  count?: number;
  tooltips?: string[];
  onChange?: (value: number) => void;
  className?: string;
}

const RateComponent: IToolboxComponent<IRateProps> = {
  type: 'rate',
  name: 'Rate',
  icon: <LikeOutlined />,
  factory: (model: IRateProps, _c, form) => {
    const { isComponentHidden, formData, formMode, setFormDataAndInstance } = useForm();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const { backendUrl } = useSheshaApplication();

    const { allowClear, icon, disabled, count, tooltips, className, style } = model;

    const eventProps = {
      model,
      form,
      formData,
      formMode,
      globalState,
      http: axiosHttp(backendUrl),
      message,
      moment,
      setFormData: setFormDataAndInstance,
      setGlobalState,
    };

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    const localCount = !_.isNaN(count) ? count : 5;

    return (
      <ConfigurableFormItem model={model}>
        <Rate
          allowClear={allowClear}
          //allowHalf={allowHalf}
          character={icon ? <ShaIcon iconName={icon as IconType} /> : <StarFilled />}
          disabled={disabled}
          count={localCount}
          tooltips={tooltips}
          className={className}
          style={getStyle(style, formData)} // Temporary. Make it configurable
          {...customRateEventHandler(eventProps)}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
};

export default RateComponent;
