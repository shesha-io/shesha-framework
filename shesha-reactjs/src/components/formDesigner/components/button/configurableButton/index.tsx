import React, { FC } from 'react';
import { Button, message } from 'antd';
import {
  useDataTableSelection,
  useForm,
  useFormData,
  useGlobalState,
  useSheshaApplication,
} from '../../../../../providers';
import ShaIcon, { IconType } from '../../../../shaIcon';
import classNames from 'classnames';
import moment from 'moment';
import { axiosHttp } from '../../../../../apis/axios';
import { IButtonGroupButton } from '../../../../../providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '../../../../../providers/configurableActionsDispatcher';

export interface IConfigurableButtonProps extends Omit<IButtonGroupButton, 'style'> {
  formComponentId: string;
  disabled?: boolean;
  hidden?: boolean;
  style?: CSSProperties;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = props => {
  const { backendUrl } = useSheshaApplication();
  const { form, formMode } = useForm();
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const { selectedRow } = useDataTableSelection(false) ?? {}; // todo: move to a generic context provider

  const { executeAction } = useConfigurableActionDispatcher();

  const onButtonClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked

    if (props.actionConfiguration) {
      // todo: implement generic context collector
      const evaluationContext = {
        selectedRow: selectedRow,
        data,
        moment: moment,
        form: form,
        formMode: formMode,
        http: axiosHttp(backendUrl),
        message: message,
        globalState: globalState,
      };
      executeAction({
        actionConfiguration: props.actionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });
    } else console.error('Action is not configured');
  };

  return (
    <Button
      title={props.tooltip}
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
