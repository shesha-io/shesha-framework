import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useFormData, useGlobalState } from '@/providers';
import { getSettings } from './settings';
import ShaIcon from '@/components/shaIcon';
import { IAlertComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const AlertComponent: IToolboxComponent<IAlertComponentProps> = {
  type: 'alert',
  isInput: false,
  name: 'Alert',
  icon: <ExclamationCircleOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const { text, alertType, description, showIcon, closable, icon, style } = model;

    const evaluatedMessage = evaluateString(text, { data: formData, globalState });
    const evaluatedDescription = evaluateString(description, formData);

    if (model.hidden) return null;
    
    return (
      <Alert
        className="sha-alert"
        message={evaluatedMessage}
        type={alertType}
        description={evaluatedDescription}
        showIcon={showIcon}
        style={getStyle(style, formData)} // Temporary. Make it configurable
        closable={closable}
        icon={icon ? <ShaIcon iconName={icon as any} /> : null}
      />
    );
  },
  initModel: (model) => ({
    alertType: 'info',
    ...model,
  }),
  migrator: (m) => m
    .add<IAlertComponentProps>(0, (prev: IAlertComponentProps) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IAlertComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAlertComponentProps>(2, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
  ,
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default AlertComponent;
