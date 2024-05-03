import React, { FC, useMemo, useState } from 'react';
import { Button, FormInstance } from 'antd';
import { ShaIcon, IconType } from '@/components';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { nanoid } from '@/utils/uuid';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'style' | 'itemSubType'> {
  style?: CSSProperties;
  form: FormInstance<any>;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = props => {
  const evaluationContext = useAvailableConstantsData();
  const { executeAction, registerActiveButton, activeButton } = useConfigurableActionDispatcher();
  const [isInProgressButton, setButtonActive] = useState<string>();
  const { loading, disabled } = useMemo(() => ({
    loading: activeButton.some(x => x?.activeButtonId === isInProgressButton && !x?.activeButtonActionName.includes('Show')),
    disabled: activeButton.some(x => x?.activeButtonId === isInProgressButton && x?.activeButtonActionName.includes('Show'))
  }), [activeButton, isInProgressButton]);

  const onButtonClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const buttonId = nanoid();
    setButtonActive(buttonId);
    registerActiveButton({
      activeButtonId: buttonId,
      activeButtonActionName: props.actionConfiguration.actionName
    });
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked
    try {
      if (props.actionConfiguration) {

        executeAction({
          actionConfiguration: { ...props.actionConfiguration, activeButton: { activeButtonId: buttonId, activeButtonActionName: props.actionConfiguration.actionName } },
          argumentsEvaluationContext: evaluationContext,

        });
      } else console.error('Action is not configured');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };


  return (
    <Button
      title={props.tooltip}
      block={props.block}
      loading={loading}
      onClick={(event) => onButtonClick(event)}
      type={props.buttonType}
      danger={props.danger}
      icon={props.icon ? <ShaIcon iconName={props.icon as IconType} /> : undefined}
      className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
      size={props?.size}
      disabled={props?.readOnly || disabled}
      style={props?.style}

    >
      {props.label}
    </Button>
  );
};

export default ConfigurableButton;