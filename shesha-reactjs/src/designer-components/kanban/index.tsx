import { FormOutlined } from '@ant-design/icons';
import React, { CSSProperties, useMemo } from 'react';
import { ConfigurableFormItem } from '@/components';
import { IToolboxComponent, useForm, validateConfigurableComponentSettings } from '@/index';
import { Alert } from 'antd';
import KanbanReactComponent from '@/components/kanban';
import { IKanbanProps } from '@/components/kanban/model';
import { KanbanSettingsForm } from './settings';
import { RefListItemGroupConfiguratorProvider } from '@/providers/refList/provider';
import { getSettings } from './settingsForm';
import { getFontStyle } from '../_settings/utils/font/utils';
import { removeUndefinedProps } from '@/utils/object';

const KanbanComponent: IToolboxComponent<IKanbanProps> = {
  type: 'kanban',
  isInput: false,
  name: 'Kanban',
  icon: <FormOutlined />,

  Factory: ({ model }) => {
    const form = useForm();
    const font = model?.font;
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    
    const additionalStyles: CSSProperties = removeUndefinedProps({
      // ...stylingBoxAsCSS,
      // ...dimensionsStyles,
      // ...borderStyles,
      ...fontStyles,
      // ...backgroundStyles,
      // ...shadowStyles
    });

    if (form.formMode === 'designer' && !model.entityType) {
      return (
        <Alert
          showIcon
          message="Kanban not configured properly"
          description="Please make sure that you've specified 'entityType' property."
          type="warning"
        />
      );
    }
    return (
      <div>
        <ConfigurableFormItem model={model}>
          {(value) => {
            return (
              <RefListItemGroupConfiguratorProvider
                value={value}
                items={model.items}
                referenceList={model.referenceList}
                readOnly={model.readOnly}
              >
                <KanbanReactComponent
                  {...model}
                  headerStyles={additionalStyles}
                />
              </RefListItemGroupConfiguratorProvider>
            );
          }}
        </ConfigurableFormItem>
      </div>
    );
  },
  initModel: (model) => ({
    ...model,
    hideLabel: true,
  }),
 settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default KanbanComponent;
