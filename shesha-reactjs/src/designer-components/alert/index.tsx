import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { useForm, useFormData, useGlobalState } from '@/providers';
import { getSettings } from './settingsForm';
import ShaIcon from '@/components/shaIcon';
import { IAlertComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import Marquee from 'react-fast-marquee';

const defaultTextForPreview = {
  success: {
    text: 'Success Alert Preview Text',
    description: 'This is a success alert preview text. More information here. If no info is provided, the description will not be displayed.'
  },
  info: {
    text: 'Info Alert Preview Text',
    description: 'Info alert preview text. More details here. Description hidden if no info is provided.'
  },
  warning: {
    text: 'Warning Alert Preview Text',
    description: 'This is a warning alert preview text. More information here. If no info is provided, the description will not be displayed.'
  },
  error: {
    text: 'Error Alert Preview Text',
    description: 'This is an error alert preview text. More information here. If no info is provided, the description will not be displayed.'
  }
};

const AlertComponent: IToolboxComponent<IAlertComponentProps> = {
  type: 'alert',
  isInput: false,
  name: 'Alert',
  icon: <ExclamationCircleOutlined />,
  Factory: ({ model }) => {
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const { formMode } = useForm();

    const { text, alertType, description, showIcon, closable, icon, style } = model;

    var evaluatedMessage = evaluateString(text, { data: formData, globalState });
    var evaluatedDescription = evaluateString(description, formData);

    if (model.hidden) return null;

    if (formMode === 'designer') {
      const previewData = defaultTextForPreview[alertType];
      if (!evaluatedMessage || evaluatedMessage?.trim() === '') {
        evaluatedMessage = previewData.text;
      }
      if (!evaluatedDescription || evaluatedDescription?.trim() === '') {
        evaluatedDescription = previewData.description;
      }
    }

    return (
      <Alert
        className="sha-alert"
        message={model.marquee ? (<Marquee pauseOnHover gradient={false}><div style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: evaluatedMessage }} /></Marquee>) :
          <div style={{ padding: '0' }} dangerouslySetInnerHTML={{ __html: evaluatedMessage }} />
        }
        banner={model.banner}
        type={alertType}
        description={!model.banner && evaluatedDescription}
        showIcon={showIcon}
        style={{ ...getStyle(style, formData), padding: '8px' }} // Temporary. Make it configurable
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
    .add<IAlertComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
  ,
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default AlertComponent;