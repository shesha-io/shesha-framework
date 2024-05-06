import React, { FC, useMemo } from 'react';
import { Button, FormInstance } from 'antd';
import { ShaIcon, IconType } from '@/components';
import classNames from 'classnames';
import { IButtonItem } from '@/providers/buttonGroupConfigurator/models';
import { CSSProperties } from 'react';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { useDynamicModals } from '@/providers';

export interface IConfigurableButtonProps extends Omit<IButtonItem, 'style' | 'itemSubType'> {
  style?: CSSProperties;
  form: FormInstance<any>;
}

export const ConfigurableButton: FC<IConfigurableButtonProps> = props => {
  const evaluationContext = useAvailableConstantsData();
  const { executeAction, getExecuting } = useConfigurableActionDispatcher();

  const { instances } = useDynamicModals()


  const getLatestVisibleInstance = () => {
    const keys = Object.keys(instances);
    let highestIndexKey = null;

    for (let i = 0; i < keys.length; i++) {
      if (
        instances[keys[i]]?.isVisible &&
        (highestIndexKey === null || instances[keys[i]]?.index > instances[highestIndexKey]?.index)
      ) {
        highestIndexKey = keys[i];
      }
    };

    return highestIndexKey ? instances[highestIndexKey] : null;
  };


  const onButtonClick = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked
    try {
      if (props.actionConfiguration) {

        executeAction({
          actionConfiguration: { ...props.actionConfiguration, callerId: props.id },
          argumentsEvaluationContext: evaluationContext,

        });
      } else console.error('Action is not configured');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const loading = getExecuting(props.id);

  const isModalOpened = getLatestVisibleInstance()?.id === props.id;
  
  const { loadingButton, disabled } = useMemo(() => {
    return {
      loadingButton: isModalOpened ? false : loading,
      disabled: isModalOpened
    }

  }, [loading, isModalOpened])


  return (
    <Button
      title={props.tooltip}
      block={props.block}
      loading={loadingButton}
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