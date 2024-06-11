import React, { FC, useState } from 'react';
import { Button, FormInstance } from 'antd';
import { ShaIcon, IconType } from '@/components';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { evaluateString, useShaRouting } from '@/index';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'style' | 'itemSubType'> {
  style?: CSSProperties;
  form: FormInstance<any>;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = props => {
  const evaluationContext = useAvailableConstantsData();
  const { getUrlFromNavigationRequest } = useShaRouting();
  const { executeAction, useActionDynamicContext } = useConfigurableActionDispatcher();
  const dynamicContext = useActionDynamicContext(props.actionConfiguration);

  const [loading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);

  const onButtonClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    try {
      if (props.actionConfiguration) {
        if (['Show Dialog', 'Show Confirmation Dialog'].includes(props.actionConfiguration?.actionName)) {
          setModal(true);
        }
        setLoading(true);
        executeAction({
          actionConfiguration: { ...props.actionConfiguration },
          argumentsEvaluationContext: { ...evaluationContext, ...dynamicContext },
        })
          .finally(() => {
            setLoading(false);
          });
      } else console.error('Action is not configured');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const { buttonLoading, buttonDisabled } = {
    buttonLoading: loading && !isModal,
    buttonDisabled: props?.readOnly || (loading && isModal)
  };

const getSearchParams = (arr): string => {
    return arr && arr.map(obj => `${encodeURIComponent(obj.key)}=${obj.value}`).join('&');
};

  const getUrlHref = (): string => {
    const searchParams = getSearchParams(props?.actionConfiguration?.actionArguments?.queryParameters);
    const href = evaluateString(props?.actionConfiguration?.actionArguments?.url+'?'+searchParams, evaluationContext);
    return href;
  };

  const getFormHref = (): string => {
    const url = getUrlFromNavigationRequest(props?.actionConfiguration?.actionArguments);
    const href = evaluateString(decodeURIComponent(url), evaluationContext);
    return href;
  };

  const getHrefValue = (navigationType?: string): string => {
    if (navigationType === "url") {
      return getUrlHref();
    } else if (navigationType === "form") {
      return getFormHref();
    } else {
      return null;
    }
  };


  return (
    <Button
      href={getHrefValue(props?.actionConfiguration?.actionArguments?.navigationType)}
      title={props.tooltip}
      block={props.block}
      loading={buttonLoading}
      onClick={onButtonClick}
      type={props.buttonType}
      danger={props.danger}
      icon={props.icon ? <ShaIcon iconName={props.icon as IconType} /> : undefined}
      className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
      size={props?.size}
      disabled={buttonDisabled}
      style={props?.style}
    >
      {props.label}
    </Button>
  );
};

export default ConfigurableButton;