import React, { FC } from 'react';
import { Button } from 'antd';
import ShaIcon, { IconType } from '../../../../shaIcon';
import classNames from 'classnames';
import { IButtonGroupButton } from '../../../../../providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '../../../../../providers/configurableActionsDispatcher';
import { useApplicationContext } from 'utils/publicUtils';

export interface IConfigurableButtonProps extends Omit<IButtonGroupButton, 'style'> {
  formComponentId: string;
  disabled?: boolean;
  hidden?: boolean;
  style?: CSSProperties;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = props => {
  const evaluationContext = useApplicationContext();
  const { executeAction } = useConfigurableActionDispatcher();

  const onButtonClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked

    if (props.actionConfiguration) {
      executeAction({
        actionConfiguration: props.actionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });
    } else console.error('Action is not configured');
  };

  return (
    <Button
      title={props.tooltip}
      block={props.block}
      onClick={event => onButtonClick(event)}
      type={props.buttonType}
      danger={props.danger}
      icon={props.icon ? <ShaIcon iconName={props.icon as IconType} /> : undefined}
      className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
      size={props?.size}
      disabled={props?.disabled}
      style={props?.style}
    >
      {props.label}
    </Button>
  );
};

export default ConfigurableButton;
