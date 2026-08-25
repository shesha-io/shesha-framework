import { FC, useState, CSSProperties } from 'react';
import * as React from 'react';
import { Button } from 'antd';
import { ButtonType } from 'antd/es/button/buttonHelpers';
import { ShaIcon, IconType } from '@/components/shaIcon';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useStyles } from './style';
import { DataContextTopLevels } from '@/providers/dataContextManager';
import { isNavigationActionConfiguration, useShaRouting } from '@/providers/shaRouting';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { useDebouncedCallback } from 'use-debounce';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'itemSubType'> {
  styleCss?: CSSProperties | undefined;
  ref?: React.Ref<HTMLAnchorElement | HTMLButtonElement> | undefined;
  className?: string | undefined;
  additionalDomProperties?: Record<string, unknown> | undefined;
  onClick?: React.MouseEventHandler<HTMLElement> | undefined;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = (props) => {
  const { actionConfiguration, dynamicItem } = props;
  const { getUrlFromNavigationRequest } = useShaRouting();
  const { executeAction, useActionDynamicContext, prepareArguments } = useConfigurableActionDispatcher();
  const dynamicContext = useActionDynamicContext(actionConfiguration);
  const evaluationContext = useAvailableConstantsData({ topContextId: DataContextTopLevels.Full }, { ...dynamicContext, dynamicItem });

  const [loading, setLoading] = useState(false);
  const debouncedLoading = useDebouncedCallback(setLoading, 100);
  const [isModal, setModal] = useState(false);

  const navigationUrl = useAsyncMemo(async () => {
    if (!isNavigationActionConfiguration(actionConfiguration) || !actionConfiguration.actionArguments)
      return undefined;
    const preparedArguments = await prepareArguments({ actionConfiguration, argumentsEvaluationContext: evaluationContext });
    return getUrlFromNavigationRequest(preparedArguments);
  }, [actionConfiguration], "");

  const isSameUrl = navigationUrl === window.location.href;
  const isGhostType = props.buttonType === 'ghost';

  const { styles } = useStyles({ model: props, isSameUrl, isGhostType });

  const { buttonLoading, buttonDisabled } = {
    buttonLoading: loading && !isModal,
    buttonDisabled: props.disabled === true || (loading && isModal),
  };


  const onButtonClick = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.preventDefault();

    // Prevent action if button is disabled
    if (buttonDisabled) {
      return;
    }

    if (props.onClick) {
      props.onClick(event);
      return;
    }

    try {
      if (actionConfiguration) {
        if (['Show Dialog', 'Show Confirmation Dialog'].includes(actionConfiguration.actionName)) {
          setModal(true);
        }
        debouncedLoading(true);
        void executeAction({
          actionConfiguration: { ...actionConfiguration },
          argumentsEvaluationContext: evaluationContext,
        })
          .finally(() => {
            debouncedLoading(false);
          });
      } else console.warn('Action is not configured');
    } catch (error) {
      debouncedLoading(false);
      console.error('Validation failed:', error);
    }
  };

  const actualButtonType = isGhostType ? 'default' : (props.buttonType as ButtonType);

  return (
    <Button
      {...(isNullOrWhiteSpace(navigationUrl) ? {} : { href: navigationUrl })}
      title={props.tooltip}
      {...(isDefined(props.block) ? { block: props.block } : {})}
      disabled={buttonDisabled}
      aria-disabled={buttonDisabled}
      tabIndex={buttonDisabled ? -1 : undefined}
      loading={buttonLoading}
      onClick={onButtonClick}
      type={actualButtonType}
      ghost={isGhostType}
      danger={props.danger ?? false}
      icon={isNullOrWhiteSpace(props.icon) ? undefined : <ShaIcon iconName={props.icon as IconType} />}
      {...(props.iconPosition ? { iconPlacement: props.iconPosition } : {})}
      className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable', styles.configurableButton, props.className)}
      size={props.size}
      style={{ ...props.styleCss, ...(buttonDisabled && { pointerEvents: "none" }) }}
      ref={props.ref}
      {...props.additionalDomProperties}
    >
      {props.label}
    </Button>
  );
};

export default ConfigurableButton;
