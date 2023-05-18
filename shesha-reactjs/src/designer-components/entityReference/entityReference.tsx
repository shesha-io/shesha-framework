import React from 'react';
import { IToolboxComponent } from 'interfaces';
import { IConfigurableFormComponent } from 'providers/form/models';
import ConfigurableFormItem from 'components/formDesigner/components/formItem';
import { useForm } from '../..';
import { EntityReference, IEntityReferenceProps } from 'components/entityReference';
import { LinkExternalOutlined } from 'icons/linkExternalOutlined';
import { EntityReferenceSettings } from './settings';

export type IActionParameters = [{ key: string; value: string }];

export interface IEntityReferenceControlProps extends IEntityReferenceProps, IConfigurableFormComponent {}

const EntityReferenceComponent: IToolboxComponent<IEntityReferenceControlProps> = {
  type: 'entityReference',
  name: 'EntityReference',
  isInput: true,
  isOutput: true,
  icon: <LinkExternalOutlined />,
  factory: ({ style, ...model }: IEntityReferenceControlProps) => {
    const { isComponentDisabled, isComponentHidden } = useForm();

    const { id, isDynamic, hidden, disabled } = model;

    const isHidden = isComponentHidden({ id, isDynamic, hidden });
    const isDisabled = isComponentDisabled({ id, isDynamic, disabled }) || model.readOnly;

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
  settingsFormFactory: (props) => {
    return <EntityReferenceSettings {...props}/>;
  },
  initModel: model => {
    const buttonModel: IEntityReferenceControlProps = {
      ...model,
    };
    return buttonModel;
  },
};

export default EntityReferenceComponent;
