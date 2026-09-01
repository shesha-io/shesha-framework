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
  /**
   * Runs before the button's own behaviour instead of replacing it: unlike `onClick`, the
   * configured action still executes afterwards. Used by hosts that need to react to the click
   * themselves (e.g. the Chevron writing the selected step back to the bound property) while
   * leaving the item's Events configuration in charge of everything else.
   */
  onBeforeClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = (props) => {
  const { actionConfiguration, dynamicItem } = props;
  const { getUrlFromNavigationRequest } = useShaRouting();
  const { executeAction, useActionDynamicContext, prepareArguments } = useConfigurableActionDispatcher();
  const dynamicContext = useActionDynamicContext(actionConfiguration);
  const evaluationContext = useAvailableConstantsData({ topContextId: DataContextTopLevels.Full }, { ...dynamicContext, dynamicItem });

  const [clickDisabled, setClickDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedLoading = useDebouncedCallback(setLoading, 100);

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
    buttonLoading: loading,
    buttonDisabled: props.disabled === true || clickDisabled,
  };


  const onButtonClick = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.preventDefault();

    // Prevent action if button is disabled
    if (buttonDisabled) {
      return;
    }

    props.onBeforeClick?.(event);

    if (props.onClick) {
      props.onClick(event);
      return;
    }

    try {
      if (actionConfiguration) {
        // Show loading indicator only if action is not related to Modal Dialog
        if (!['Show Dialog', 'Show Confirmation Dialog'].includes(actionConfiguration.actionName))
          debouncedLoading(true);
        setClickDisabled(true);
        void executeAction({
          actionConfiguration: { ...actionConfiguration },
          argumentsEvaluationContext: evaluationContext,
        })
          .finally(() => {
            setClickDisabled(false);
            debouncedLoading(false);
          });
      } else if (!isDefined(props.onBeforeClick)) console.warn('Action is not configured');
    } catch (error) {
      setClickDisabled(false);
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
