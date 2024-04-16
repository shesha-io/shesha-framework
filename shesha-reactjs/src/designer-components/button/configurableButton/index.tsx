import React, { FC } from 'react';
import { Button, FormInstance } from 'antd';
import { ShaIcon, IconType } from '@/components';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useAvailableConstantsData } from '@/providers/form/utils';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'style' | 'itemSubType'> {
  style?: CSSProperties;
  form: FormInstance<any>;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = props => {
  const evaluationContext = useAvailableConstantsData();
  const { executeAction } = useConfigurableActionDispatcher();

  const onButtonClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>, actionName: string) => {
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked
    try {
 
      if (props.actionConfiguration) {
        console.log("values-action level 2::",props?.form.getFieldsValue(),actionName);
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