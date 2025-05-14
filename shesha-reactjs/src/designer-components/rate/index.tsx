import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';
import { getAllEventHandlers } from '@/components/formDesigner/components/utils';
import { getSettings } from './settingsForm';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IconType } from '@/components/shaIcon';
import { IToolboxComponent } from '@/interfaces';
import { LikeOutlined, StarFilled } from '@ant-design/icons';
import { Rate } from 'antd';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IConfigurableFormComponent } from '@/providers';
import {
  ConfigurableFormItem,
  ShaIcon,
} from '@/components';
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
  calculateModel: (model, allData) => ({
    eventHandlers: getAllEventHandlers(model, allData),
  }),
  Factory: ({ model, calculatedModel }) => {
    const { allowClear, icon, count, tooltips, className, readOnly } = model;
    const localCount = !_.isNaN(count) ? count : 5;

    return model.hidden
      ? null
      : <ConfigurableFormItem model={model}>
        {(value,  onChange) => {
          const customEvent = calculatedModel.eventHandlers;
          const onChangeInternal = (value: number) => {
            customEvent.onChange({value});
            if (typeof onChange === 'function') onChange(value);
          };
          
          return <Rate
            allowClear={allowClear}
            //allowHalf={allowHalf}
            character={icon ? <ShaIcon iconName={icon as IconType} /> : <StarFilled />}
            disabled={readOnly}
            count={localCount ?? 5}
            tooltips={tooltips}
            className={classNames(className, 'sha-rate')}
            style={model.allStyles.fullStyle}
            {...customEvent}
            value={value}
            onChange={onChangeInternal}
          />;
        }}
      </ConfigurableFormItem>
    ;
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IRateProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IRateProps>(1, (prev) => migrateVisibility(prev))
    .add<IRateProps>(2, (prev) => migrateReadOnly(prev))
    .add<IRateProps>(3, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
    .add<IRateProps>(4, (prev) => {
      prev.hideLabel = true;
      if (!prev.icon) prev.icon = 'StarFilled';
      return prev;
    })
  ,
};

export default RateComponent;
