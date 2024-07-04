import React, { FC, useState } from 'react';
import { Button, FormInstance } from 'antd';
import { ShaIcon, IconType } from '@/components';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { isNavigationActionConfiguration, useShaRouting } from '@/index';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'style' | 'itemSubType'> {
  style?: CSSProperties;
  form: FormInstance<any>;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = props => {
  const { actionConfiguration } = props;
  const evaluationContext = useAvailableConstantsData();
  const { getUrlFromNavigationRequest } = useShaRouting();
  const { executeAction, useActionDynamicContext, prepareArguments } = useConfigurableActionDispatcher();
  const dynamicContext = useActionDynamicContext(actionConfiguration);

  const [loading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);

  const onButtonClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    try {
      if (actionConfiguration) {
        if (['Show Dialog', 'Show Confirmation Dialog'].includes(actionConfiguration?.actionName)) {
          setModal(true);
        }
        setLoading(true);
        executeAction({
          actionConfiguration: { ...actionConfiguration },
          argumentsEvaluationContext: { ...evaluationContext, ...dynamicContext },
        })
          .finally(() => {
            setLoading(false);
          });
      } else console.error('Action is not configured');
    } catch (error) {
      setLoading(false);
      console.error('Validation failed:', error);
    }
  };

  const { buttonLoading, buttonDisabled } = {
    buttonLoading: loading && !isModal,
    buttonDisabled: props?.readOnly || (loading && isModal)
  };


  const navigationUrl = useAsyncMemo(async () => {
    if (!isNavigationActionConfiguration(actionConfiguration) || !actionConfiguration.actionArguments)
      return null;
    const preparedArguments = await prepareArguments({ actionConfiguration, argumentsEvaluationContext: evaluationContext });
    return getUrlFromNavigationRequest(preparedArguments);
  }, [actionConfiguration], "");

  return (
    <Button
      href={navigationUrl}
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