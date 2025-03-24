import React, { forwardRef, useState, useImperativeHandle } from 'react';
import { Button, FormInstance } from 'antd';
import { ShaIcon, IconType } from '@/components';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { isNavigationActionConfiguration, useShaRouting, useTheme } from '@/index';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'style' | 'itemSubType'> {
  style?: CSSProperties;
  form: FormInstance<any>;
  dynamicItem?: any;  
}

export const ConfigurableButton = forwardRef((props: IConfigurableButtonProps, ref) => {
  const { actionConfiguration, dynamicItem } = props;
  const evaluationContext = useAvailableConstantsData();
  const { getUrlFromNavigationRequest } = useShaRouting();
  const { executeAction, useActionDynamicContext, prepareArguments } = useConfigurableActionDispatcher();
  const dynamicContext = useActionDynamicContext(actionConfiguration);

  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);

  const onButtonClick = async (event?: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (event) event.preventDefault();
    try {
      if (actionConfiguration) {
        if (['Show Dialog', 'Show Confirmation Dialog'].includes(actionConfiguration?.actionName)) {
          setModal(true);
        }
        setLoading(true);
        executeAction({
          actionConfiguration: { ...actionConfiguration },
          argumentsEvaluationContext: { ...evaluationContext, ...dynamicContext, dynamicItem }
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

  // Expose the click function through ref
  useImperativeHandle(ref, () => ({
    triggerClick: onButtonClick,
    actionConfiguration
  }));

  const { buttonLoading, buttonDisabled } = {
    buttonLoading: loading && !isModal,
    buttonDisabled: props?.readOnly || (loading && isModal)
  };

  const navigationUrl = useAsyncMemo(async () => {
    if (!isNavigationActionConfiguration(actionConfiguration) || !actionConfiguration.actionArguments)
      return undefined;
    const preparedArguments = await prepareArguments({ actionConfiguration, argumentsEvaluationContext: evaluationContext });
    return getUrlFromNavigationRequest(preparedArguments);
  }, [actionConfiguration], "");

  const isSameUrl = navigationUrl === window.location.href;

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
      iconPosition={props.iconPosition}
      className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
      size={props?.size}
      disabled={buttonDisabled}
      style={{ ...props?.style, ...(isSameUrl && { background: theme.application.primaryColor, color: theme.text.default }) }}
    >
      {props.label}
    </Button>
  );
});

export default ConfigurableButton;