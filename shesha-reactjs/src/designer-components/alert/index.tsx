import { CSSProperties, ReactNode, useEffect, useRef } from 'react';
import * as React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { ShaIcon } from '@/components/shaIcon';
import { AlertComponentDefinition, AlertType, IAlertComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions, migrateHiddenToVisible } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import Marquee from 'react-fast-marquee';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getStringPropertyOrUndefined } from '@/utils/object';
import { useStyles } from './styles';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { useComponentApi } from '@/providers/componentApi/provider';
import { useEffectOnce } from 'react-use';
import { AlertApi } from '@/componentsApi/componentApi';

import apiCode from "../../componentsApi/componentApi.ts?raw";
import { IStyleValue } from '@/providers/form/models';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { defaultStyles } from './utils';

const defaultTextForPreview: Record<AlertType, { text: string; description: string }> = {
  success: { text: 'Success Alert Preview Text', description: 'This is a success alert preview text. More information here.' },
  info: { text: 'Info Alert Preview Text', description: 'This is an info alert preview text. More information here.' },
  warning: { text: 'Warning Alert Preview Text', description: 'This is a warning alert preview text. More information here.' },
  error: { text: 'Error Alert Preview Text', description: 'This is an error alert preview text. More information here.' },
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
  allowInherit: true,
  type: 'alert',
  isInput: false,
  name: 'Alert',
  icon: <ExclamationCircleOutlined />,
  getWrapperStyle: (model) => ({ style: { dimensions: model.dimensions } }),
  calculateModel: (_model, allData) => ({
    formMode: allData.form?.formMode ?? 'readonly',
  }),
  Factory: ({ model, calculatedModel, apiContext }) => {
    const { styles } = useStyles(model);
    const handleEvent = useEvents<void>(model.componentName);

    const { alertType, showIcon, closable, icon } = model;
    let { formMode } = calculatedModel;

    const componentApi = useComponentApi();
    const inputRef = useRef(null);
    useEffect(() => {
      componentApi?.updateApi<AlertApi>({
        id: model.id,
        componentName: model.componentName ?? "",
        level: 3,
        typeDefinition: { typeName: 'AlertApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
        properties: [
          { name: 'text', getter: () => model.text, setter: (value) => apiContext?.updateApiModel({ text: value ?? "" }) },
          { name: 'description', getter: () => model.description, setter: (value) => apiContext?.updateApiModel({ description: value }) },
        ],
      });
    }, [componentApi, model.componentName, model.id, model.text, model.description, apiContext]);
    useEffectOnce(() => () => componentApi?.removeApi(model.id));

    if (model.hidden === true) return null;

    const previewData = formMode === 'designer' && isDefined(alertType) ? defaultTextForPreview[alertType] : undefined;

    const renderContent = (content: string | React.ReactNode): ReactNode => {
      if (typeof content === 'string' && !isNullOrWhiteSpace(content)) {
        const contentStr = isDefined(content) ? content.replaceAll('\n', '<br>') : '';
        const hasHtmlTags = contentStr.match(/<\/?[a-z][\s\S]*>/i);

        if (hasHtmlTags) {
          const sanitizedContent = DOMPurify.sanitize(contentStr, { USE_PROFILES: { html: true } });
          const parsedContent = parse(sanitizedContent);
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
      }
      if (React.isValidElement<PropsWithStyle>(content)) {
        return setElementStyle(content, {
          padding: 0,
          margin: 0,
          lineHeight: 'normal',
        });
      }
      return null;
    };

    const messageContent = renderContent(isNullOrWhiteSpace(model.text) ? previewData?.text ?? '' : model.text);
    const descriptionContent = renderContent(isNullOrWhiteSpace(model.description) ? previewData?.description ?? '' : model.description);

    return (
      <Alert
        className={styles.shaAlert}
        title={model.marquee === true ? <Marquee pauseOnHover gradient={false}>{messageContent}</Marquee> : messageContent}
        description={descriptionContent}
        {...(alertType ? { type: alertType } : {})}
        {...(isDefined(closable) ? { closable } : {})}
        showIcon={showIcon ?? false}
        icon={!isNullOrWhiteSpace(icon) ? <ShaIcon iconName={icon} /> : null}
        {...(isDefined(model.styleCss) ? { style: model.styleCss } : {})}
        ref={inputRef}
        {...getComponentEvents<void, IAlertComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}
      />
    );
  },
  getDefaultStyles: defaultStyles,
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
    .add<IAlertComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
    .add<IAlertComponentProps>(3, (prev, ctx) => {
      const padding: { desktop?: IStyleValue | undefined } = ctx.isNew === true ? {} : {
        desktop: {
          stylingBoxJson: {
            _type: 'styleBox',
            paddingBottom: 8,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 8,
          },
        },
      };
      return migratePermissionsToVisiblePermissions(migrateHiddenToVisible({
        ...prev,
        ...padding,
      }));
    }),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  previewConfiguration: {
    type: 'alert',
    componentName: 'sha-alert',
    propertyName: 'sha-alert',
    text: 'This is an alert title',
    description: 'This is an alert description',
    alertType: 'info',
    closable: true,
    showIcon: true,
    marquee: true,
    id: 'sha-alert',
    version: 'latest',
  },
};

export default AlertComponent;
