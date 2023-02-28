import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { getStyle, validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormData } from '../../../../providers';
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
    const { data } = useFormData();
    const { text, alertType, description, showIcon, closable, icon, style } = model;

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    return (
      <Alert
        message={text}
        type={alertType}
        description={description}
        showIcon={showIcon}
        style={getStyle(style, data)} // Temporary. Make it configurable
        closable={closable}
        icon={icon ? <ShaIcon iconName={icon as any} /> : null}
      />
    );
  },
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
};

export default AlertComponent;
