import React, { CSSProperties, ReactNode } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { evaluateString, getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { ShaIcon } from '@/components/shaIcon';
import { AlertComponentDefinition, AlertType, IAlertComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import Marquee from 'react-fast-marquee';
import parse from 'html-react-parser';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getStringPropertyOrUndefined } from '@/utils/object';

const defaultTextForPreview: Record<AlertType, { text: string; description: string }> = {
  success: {
    text: 'Success Alert Preview Text',
    description: 'This is a success alert preview text. More information here.',
  },
  info: {
    text: 'Info Alert Preview Text',
    description: 'This is an info alert preview text. More information here.',
  },
  warning: {
    text: 'Warning Alert Preview Text',
    description: 'This is a warning alert preview text. More information here.',
  },
  error: {
    text: 'Error Alert Preview Text',
    description: 'This is an error alert preview text. More information here.',
  },
};

type PropsWithStyle = {
  style?: CSSProperties;
  className?: string;
};
const setElementStyle = <P extends PropsWithStyle>(
  element: React.ReactElement<P>,
  newStyle: CSSProperties,
  newClassName?: string,
): React.ReactElement<P> => {
  const existingStyle = element.props.style || {};
  const mergedStyle = { ...existingStyle, ...newStyle };
  return React.cloneElement(element, { style: mergedStyle, className: newClassName } as Partial<P>);
};

const AlertComponent: AlertComponentDefinition = {
  type: 'alert',
  isInput: false,
  name: 'Alert',
  icon: <ExclamationCircleOutlined />,
  calculateModel: (model, allData) => ({
    evaluatedMessage: evaluateString(model.text, { data: allData.data, globalState: allData.globalState }),
    evaluatedDescription: evaluateString(model.description, allData.data ?? {}),
    formMode: allData.form?.formMode ?? 'readonly',
  }),
  Factory: ({ model, calculatedModel }) => {
    const { alertType, showIcon, closable, icon, style } = model;
    let { evaluatedMessage, evaluatedDescription, formMode } = calculatedModel;

    if (model.hidden) return null;

    if (formMode === 'designer') {
      const previewData = alertType ? defaultTextForPreview[alertType] : undefined;
      if (previewData) {
        if (isNullOrWhiteSpace(evaluatedMessage))
          evaluatedMessage = previewData.text;
        if (isNullOrWhiteSpace(evaluatedDescription))
          evaluatedDescription = previewData.description;
      }
    }

    const renderContent = (content: string | React.ReactNode): ReactNode => {
      if (React.isValidElement<PropsWithStyle>(content)) {
        return setElementStyle(content, {
          padding: 0,
          margin: 0,
          lineHeight: 'normal',
        });
      }

      const contentStr = String(content || '');
      const hasHtmlTags = contentStr.match(/<\/?[a-z][\s\S]*>/i);

      if (hasHtmlTags) {
        const parsedContent = parse(contentStr);
        // If parsed content is a React element, apply our styles
        if (React.isValidElement<PropsWithStyle>(parsedContent)) {
          return setElementStyle(parsedContent, {
            padding: 0,
            margin: 0,
            lineHeight: 'normal',
          }, 'sha-alert-content');
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
        title={model.marquee ? (
          <Marquee pauseOnHover gradient={false}>
            {messageContent}
          </Marquee>
        ) : messageContent}
        banner={model.banner ?? false}
        {...(alertType ? { type: alertType } : {})}
        description={descriptionContent}
        showIcon={showIcon ?? false}
        style={{ ...getStyle(style, {}), padding: '8px' }} // Temporary. Make it configurable
        {...(isDefined(closable) ? { closable } : {})}
        icon={icon ? <ShaIcon iconName={icon} /> : null}
      />
    );
  },
  initModel: (model) => ({
    alertType: 'info',
    ...model,
  }),
  migrator: (m) => m
    .add<IAlertComponentProps>(0, (prev) => ({
      ...migratePropertyName(migrateCustomFunctions(prev)),
      text: getStringPropertyOrUndefined(prev, 'text') ?? "",
    }))
    .add<IAlertComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IAlertComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default AlertComponent;
