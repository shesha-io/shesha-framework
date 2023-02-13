import React, { FC } from 'react';
import { message, Button } from 'antd';
import { useForm, useSheshaApplication, useGlobalState } from '../../../../../../providers';
import { ISelectionProps } from '../../../../../../providers/dataTableSelection/models';
import { IToolbarButton } from '../../../../../../providers/toolbarConfigurator/models';
import ShaIcon, { IconType } from '../../../../../shaIcon';
import classNames from 'classnames';
import moment from 'moment';
import { useConfigurableActionDispatcher } from '../../../../../../providers/configurableActionsDispatcher';
import { axiosHttp } from '../../../../../../apis/axios';

export interface IToolbarButtonProps extends IToolbarButton {
  formComponentId: string;
  selectedRow: ISelectionProps;
}

export const ToolbarButton: FC<IToolbarButtonProps> = props => {
  const { form, formData, formMode } = useForm();
  const { backendUrl } = useSheshaApplication();
  const { globalState } = useGlobalState();

  const { executeAction } = useConfigurableActionDispatcher();

  const onButtonClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked

    if (props.actionConfiguration){
      // todo: implement generic context collector
      const evaluationContext = {
        selectedRow: props.selectedRow,
        data: formData,
        moment: moment,
        form: form,
        formMode: formMode,
        http: axiosHttp(backendUrl),
        message: message,
        globalState: globalState,        
      };
      executeAction({ 
        actionConfiguration: props.actionConfiguration,
        argumentsEvaluationContext: evaluationContext
      });
    } else
    console.error('Action is not configured');
  };

  return (
    <Button
      title={props.tooltip}
      onClick={event => onButtonClick(event)}
      type={props.buttonType}
      danger={props.danger}
      icon={props.icon ? <ShaIcon iconName={props.icon as IconType} /> : undefined}
      className={classNames('sha-toolbar-btn sha-toolbar-btn-configurable')}
    >
      {props.name}
    </Button>
  );
};

export default ToolbarButton;