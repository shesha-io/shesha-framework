import React from 'react';
import { IToolboxComponent } from 'interfaces';
import { IConfigurableFormComponent } from 'providers/form/models';
import ConfigurableFormItem from 'components/formDesigner/components/formItem';
import { useForm } from '../..';
import { EntityReference, IEntityReferenceProps } from 'components/entityReference';
import { LinkExternalOutlined } from 'icons/linkExternalOutlined';
import { EntityReferenceSettingsForm } from './settings';
import { migratePropertyName } from 'designer-components/_settings/utils';

export type IActionParameters = [{ key: string; value: string }];

export interface IEntityReferenceControlProps extends IEntityReferenceProps, IConfigurableFormComponent {}

const EntityReferenceComponent: IToolboxComponent<IEntityReferenceControlProps> = {
  type: 'entityReference',
  name: 'Entity Reference',
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
        {(value) => {
          return !isHidden &&
            <EntityReference
                {...model}
                disabled={isDisabled}
                value={value}
            />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormFactory: (props) => {
    return <EntityReferenceSettingsForm {...props}/>;
  },
  migrator: m => m
    .add<IEntityReferenceControlProps>(0, prev => {
      return {
        ...prev,
        formSelectionMode: 'name',
        entityReferenceType: 'Quickview',
        quickviewWidth: 600,
        displayProperty: '',
        handleFail: false,
        handleSuccess: false
      };
    })
    .add<IEntityReferenceControlProps>(1, (prev) => migratePropertyName(prev))
  ,
  linkToModelMetadata: (model, metadata): IEntityReferenceControlProps => {
    return {
      ...model,
      entityType: metadata.entityType,
    };
  },
};

export default EntityReferenceComponent;
