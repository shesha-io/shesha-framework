import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FilterOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { AdvancedFilterButton } from './advancedFilterButton';
import { IButtonComponentProps } from '@/designer-components/button/interfaces';
import { Show } from '@/components';
import { Tooltip } from 'antd';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';

const AdvancedFilterButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'datatable.filter',
  isInput: false,
  name: 'Table Filter',
  icon: <FilterOutlined />,
  Factory: ({ model }) =>
    model.hidden ? null : (
      <div>
        <AdvancedFilterButton {...model} styles={model.allStyles.fullStyle} />
        <Show when={Boolean(model.tooltip?.trim())}>
          <Tooltip title={model.tooltip}>
            <QuestionCircleOutlined className="tooltip-question-icon" size={14} color="gray" />
          </Tooltip>
        </Show>
      </div>
    ),
  initModel: (model) => {
    return {
      ...model,
      buttonType: 'link',
      label: '',
    };
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: m =>
    m
      .add<IButtonComponentProps>(3, (prev) => migrateReadOnly(prev, 'inherited'))
      .add<IButtonComponentProps>(4, (prev) => ({ ...migratePrevStyles(prev, defaultStyles(prev)) })),
};

export default AdvancedFilterButtonComponent;
