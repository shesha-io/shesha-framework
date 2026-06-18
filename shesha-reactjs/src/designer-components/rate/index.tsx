import _ from 'lodash';
import classNames from 'classnames';
import React from 'react';
import { getSettings } from './settingsForm';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { IconType } from '@/components/shaIcon';
import { IToolboxComponent } from '@/interfaces';
import { LikeOutlined, StarFilled } from '@ant-design/icons';
import { Rate } from 'antd';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IConfigurableFormComponent } from '@/providers';
import { ShaIcon } from '@/components/shaIcon';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { isDefined } from '@/utils/nullables';

export interface IRateProps extends IConfigurableFormComponent {
  value?: number;
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
  preserveDimensionsInDesigner: true,
  Factory: ({ model }) => {
    const { allowClear, icon, count, tooltips, className, readOnly } = model;
    const localCount = !_.isNaN(count) ? count : 5;

    return model.hidden
      ? null
      : (
        <ConfigurableFormItem<number> model={model}>
          {(value, onChange, _, ctx) => {
            return (
              <Rate
                allowClear={allowClear ?? false}
                character={icon ? <ShaIcon iconName={icon as IconType} /> : <StarFilled />}
                disabled={readOnly ?? false}
                count={localCount ?? 5}
                {...(isDefined(tooltips) ? { tooltips } : {})}
                className={classNames(className, 'sha-rate')}
                style={{ ...model.allStyles?.fullStyle, display: 'flex', alignItems: 'center' }}
                {...(isDefined(value) ? { value } : {})}
                onChange={(newValue) => {
                  ctx?.handleEvent(undefined, newValue, model.onChangeCustom);
                  onChange(newValue);
                }}
                onFocus={() => ctx?.handleEvent(undefined, value, model.onFocusCustom)}
                onBlur={() => ctx?.handleEvent(undefined, value, model.onBlurCustom)}
              />
            );
          }}
        </ConfigurableFormItem>
      )
    ;
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IRateProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IRateProps>(1, (prev) => migrateVisibility(prev))
    .add<IRateProps>(2, (prev) => migrateReadOnly(prev))
    .add<IRateProps>(3, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IRateProps>(4, (prev) => {
      prev.hideLabel = true;
      if (!prev.icon) prev.icon = 'StarFilled';
      return prev;
    }),
};

export default RateComponent;
