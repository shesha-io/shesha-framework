import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { FilterOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { AdvancedFilterButton } from './advancedFilterButton';
import { IButtonComponentProps } from '@/designer-components/button/interfaces';
import { Show } from '@/components';
import { Tooltip } from 'antd';

const AdvancedFilterButtonComponent: IToolboxComponent<IButtonComponentProps> = {
  type: 'datatable.filter',
  name: 'Table Filter',
  icon: <FilterOutlined />,
  Factory: ({ model }) =>
    model.hidden ? null : (
      <div>
        <AdvancedFilterButton {...model} />
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
  settingsFormMarkup: (context) => getSettings(context),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default AdvancedFilterButtonComponent;
