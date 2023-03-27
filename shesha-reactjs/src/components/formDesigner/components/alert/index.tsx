import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData, useGlobalState } from '../../../../providers';
import { getSettings } from './settings';
import ShaIcon from '../../../shaIcon';

export interface IAlertProps extends IConfigurableFormComponent {
  text: string;
  description?: string;
  showIcon?: boolean;
  alertType?: 'success' | 'info' | 'warning' | 'error';
  closable?: boolean;
  icon?: string;
}

const AlertComponent: IToolboxComponent<IAlertProps> = {
  type: 'alert',
  name: 'Alert',
  icon: <ExclamationCircleOutlined />,
  factory: (model: IAlertProps) => {
    const { isComponentHidden } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const { text, alertType, description, showIcon, closable, icon, style } = model;

    const evaluatedMessage = evaluateString(text, { ...formData, ...globalState });

    const evaluatedDescription = evaluateString(description, formData);

    if (isComponentHidden(model)) return null;

    return (
      <Alert
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
  initModel: model => ({
    alertType: 'info',
    ...model,
  }),
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
};

export default AlertComponent;
