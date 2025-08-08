import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { FormMode } from '@/providers';
import { getSettings } from './settingsForm';
import ShaIcon from '@/components/shaIcon';
import { IAlertComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import Marquee from 'react-fast-marquee';
import parse from 'html-react-parser';

const defaultTextForPreview = {
  success: {
    text: 'Success Alert Preview Text',
    description: 'This is a success alert preview text. More information here.'
  },
  info: {
    text: 'Info Alert Preview Text',
    description: 'This is an info alert preview text. More information here.'
  },
  warning: {
    text: 'Warning Alert Preview Text',
    description: 'This is a warning alert preview text. More information here.'
  },
  error: {
    text: 'Error Alert Preview Text',
    description: 'This is an error alert preview text. More information here.'
  }
};

interface IAlertComponentCalulatedValues {
  evaluatedMessage: string;
  evaluatedDescription: string;
  formMode: FormMode;
}

const AlertComponent: IToolboxComponent<IAlertComponentProps, IAlertComponentCalulatedValues> = {
  type: 'alert',
  isInput: false,
  name: 'Alert',
  icon: <ExclamationCircleOutlined />,
  calculateModel: (model, allData) => ({
    evaluatedMessage: evaluateString(model.text, { data: allData.data, globalState: allData.globalState }),
    evaluatedDescription: evaluateString(model.description, allData.data),
    formMode: allData.form.formMode,
  }),
  Factory: ({ model, calculatedModel }) => {
    const { alertType, showIcon, closable, icon, style } = model;
    let { evaluatedMessage, evaluatedDescription, formMode } = calculatedModel;

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

    const renderContent = (content: string | React.ReactNode) => {
      if (React.isValidElement(content)) {
        return React.cloneElement(content as React.ReactElement, {
          style: {
            ...(content as React.ReactElement).props?.style,
            padding: 0,
            margin: 0,
            lineHeight: 'normal'
          }
        });
      }

      const contentStr = String(content || '');
      const hasHtmlTags = contentStr.match(/<\/?[a-z][\s\S]*>/i);

      if (hasHtmlTags) {
        const parsedContent: any = parse(contentStr);
        // If parsed content is a React element, apply our styles
        if (React.isValidElement(parsedContent)) {
          return React.cloneElement(parsedContent as React.ReactElement, {
            className: 'sha-alert-content',
            ...(parsedContent as React.ReactElement).props,
            style: {
              ...(parsedContent as React.ReactElement).props?.style,
              padding: 0,
              margin: 0,
              lineHeight: 'normal'
            }
          });
        }
        return parsedContent;
      }

      return <span style={{ padding: 0, margin: 0, lineHeight: 'normal' }}>{contentStr}</span>;
    };

    const messageContent = renderContent(evaluatedMessage);
    const descriptionContent = evaluatedDescription ? renderContent(evaluatedDescription) : null;

    return (
      <Alert
        className="sha-alert"
        message={model.marquee ? (
          <Marquee pauseOnHover gradient={false}>
            {messageContent}
          </Marquee>
        ) : messageContent}
        banner={model.banner}
        type={alertType}
        description={descriptionContent}
        showIcon={showIcon}
        style={{ ...getStyle(style, {}), padding: '8px' }} // Temporary. Make it configurable
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