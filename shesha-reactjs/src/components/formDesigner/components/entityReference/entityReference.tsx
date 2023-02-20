import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import ConfigurableFormItem from '../formItem';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../..';
import { EntityReference, IEntityReferenceProps } from '../../../entityReference';
import { LinkExternalOutlined } from '../../../../icons/linkExternalOutlined';
import { getSettings } from './settings';

export type IActionParameters = [{ key: string; value: string }];

export interface IEntityReferenceControlProps extends IEntityReferenceProps, IConfigurableFormComponent {}

const EntityReferenceComponent: IToolboxComponent<IEntityReferenceControlProps> = {
  type: 'entityReference',
  name: 'EntityReference',
  icon: <LinkExternalOutlined />,
  factory: ({ style, ...model }: IEntityReferenceControlProps) => {
    const { isComponentDisabled, isComponentHidden } = useForm();

    const { id, isDynamic, hidden, disabled } = model;

    const isHidden = isComponentHidden({ id, isDynamic, hidden });
    const isDisabled = isComponentDisabled({ id, isDynamic, disabled });

    return (
      <ConfigurableFormItem model={model}>
        {!isHidden &&
            <EntityReference
                {...model}
                disabled={isDisabled}
            />
        }
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
  initModel: model => {
    const buttonModel: IEntityReferenceControlProps = {
      ...model,
    };
    return buttonModel;
  },
};

export default EntityReferenceComponent;
