import _ from 'lodash';
import classNames from 'classnames';
import moment from 'moment';
import React from 'react';
import { customRateEventHandler } from '@/components/formDesigner/components/utils';
import { getSettings } from './settings';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IconType } from '@/components/shaIcon';
import { IToolboxComponent } from '@/interfaces';
import { LikeOutlined, StarFilled } from '@ant-design/icons';
import { App, Rate } from 'antd';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import {
 
  IConfigurableFormComponent,
  useForm,
  useFormData,
  useGlobalState,
  useHttpClient,
} from '@/providers';
import {
  ConfigurableFormItem,
  ShaIcon,
} from '@/components';
import { getFormApi } from '@/providers/form/formApi';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

export interface IRateProps extends IConfigurableFormComponent {
  value?: number;
  defaultValue?: number;
  allowClear?: boolean;
  allowHalf?: boolean;
  icon?: string;
  count?: number;
  tooltips?: string[];
  onChange?: (value: number) => void;
  className?: string;
}

const RateComponent: IToolboxComponent<IRateProps> = {
  type: 'rate',
  name: 'Rate',
  icon: <LikeOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    const form = useForm();
    const { data: formData } = useFormData();
    const { globalState, setState: setGlobalState } = useGlobalState();
    const httpClient = useHttpClient();
    const { message } = App.useApp();

    const { allowClear, icon, count, tooltips, className, style, readOnly } = model;

    const eventProps = {
      model,
      form: getFormApi(form),
      formData,
      globalState,
      http: httpClient,
      message,
      moment,
      setGlobalState,
    };

    if (model.hidden) return null;

    const localCount = !_.isNaN(count) ? count : 5;

    return (
      <ConfigurableFormItem model={model}>
        {(value,  onChange) => {
          const customEvent =  customRateEventHandler(eventProps);
          const onChangeInternal = (...args: any[]) => {
            customEvent.onChange(args[0]);
            if (typeof onChange === 'function') 
              onChange(args);
          };
          
          return <Rate
            allowClear={allowClear}
            //allowHalf={allowHalf}
            character={icon ? <ShaIcon iconName={icon as IconType} /> : <StarFilled />}
            disabled={readOnly}
            count={localCount}
            tooltips={tooltips}
            className={classNames(className, 'sha-rate')}
            style={getStyle(style, formData)} // Temporary. Make it configurable
            {...customEvent}
            value={value}
            onChange={onChangeInternal}
          />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IRateProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IRateProps>(1, (prev) => migrateVisibility(prev))
    .add<IRateProps>(2, (prev) => migrateReadOnly(prev))
    .add<IRateProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
  ,
};

export default RateComponent;
