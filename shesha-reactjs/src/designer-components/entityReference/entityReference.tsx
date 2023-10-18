import React from 'react';
import { EntityReference, IEntityReferenceProps } from '../../components/entityReference';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import { LinkExternalOutlined } from '../../icons/linkExternalOutlined';
import { IToolboxComponent } from '../../interfaces';
import { IConfigurableFormComponent } from '../../providers/form/models';
import { EntityReferenceSettingsForm } from './settings';
import { migratePropertyName, migrateCustomFunctions } from '../../designer-components/_common-migrations/migrateSettings';
import { isEntityReferencePropertyMetadata } from 'interfaces/metadata';

export type IActionParameters = [{ key: string; value: string }];

export interface IEntityReferenceControlProps extends IEntityReferenceProps, IConfigurableFormComponent {}

const EntityReferenceComponent: IToolboxComponent<IEntityReferenceControlProps> = {
  type: 'entityReference',
  name: 'Entity Reference',
  isInput: true,
  isOutput: true,
  icon: <LinkExternalOutlined />,
  factory: ({ style, hidden, disabled, ...model }: IEntityReferenceControlProps) => {
    if (hidden)
      return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value) => {
          return <EntityReference
                {...model}
                disabled={disabled}
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
    .add<IEntityReferenceControlProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
  linkToModelMetadata: (model, propMetadata): IEntityReferenceControlProps => {
    return {
      ...model,
      entityType: isEntityReferencePropertyMetadata(propMetadata) ? propMetadata.entityType : undefined,
    };
  },
};

export default EntityReferenceComponent;
