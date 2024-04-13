import React, { FC } from 'react';
import { Button, FormInstance } from 'antd';
import { ShaIcon, IconType } from '@/components';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useApplicationContext } from '@/providers/form/utils';
import { NON_PROGRESSIVE_ACTIONS } from '@/shesha-constants';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'style' | 'itemSubType'> {
  style?: CSSProperties;
  form: FormInstance<any>;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = (props) => {
  const evaluationContext = useApplicationContext();
  const { executeAction } = useConfigurableActionDispatcher();

  const onButtonClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>, actionName: string) => {
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked
    try {
      const isFormSubmit = !NON_PROGRESSIVE_ACTIONS.includes(actionName);

      if (isFormSubmit) await props?.form?.validateFields();

      if (props.actionConfiguration) {
        executeAction({
          actionConfiguration: props.actionConfiguration,
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
      onClick={(event) => onButtonClick(event, props.actionConfiguration?.actionName)}
      type={props.buttonType}
      danger={props.danger}
      icon={props.icon ? <ShaIcon iconName={props.icon as IconType} /> : undefined}
      className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
      size={props?.size}
      disabled={props?.readOnly}
      style={props?.style}
    >
      {props.label}
    </Button>
  );
};

export default ConfigurableButton;
