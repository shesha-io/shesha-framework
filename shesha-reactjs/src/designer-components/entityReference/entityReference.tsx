import { EntityReference, IEntityReferenceProps } from '@/components/entityReference';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { ShaIconTypes } from '@/components/iconPicker';
import {
  migrateCustomFunctions,
  migratePropertyName,
  migrateReadOnly,
} from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { LinkExternalOutlined } from '@/icons/linkExternalOutlined';
import { IToolboxComponent } from '@/interfaces';
import { isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { IConfigurableFormComponent } from '@/providers/form/models';
import React from 'react';
import { migrateNavigateAction } from '../_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';

export type IActionParameters = [{ key: string; value: string }];

export interface IEntityReferenceControlProps
  extends Omit<IEntityReferenceProps, 'style'>,
    Omit<IConfigurableFormComponent, 'style'> {
  /** @deprecated Use iconName instead */
  icon?: string;
}

const EntityReferenceComponent: IToolboxComponent<IEntityReferenceControlProps> = {
  type: 'entityReference',
  name: 'Entity Reference',
  isInput: true,
  isOutput: true,
  icon: <LinkExternalOutlined />,
  Factory: ({ model: passedModel }) => {
    const { allStyles, hidden, readOnly, ...model } = passedModel;

    if (hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value) => {
          return <EntityReference {...model} value={value} style={{ ...allStyles.fullStyle }} />;
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) =>
    m
      .add<IEntityReferenceControlProps>(0, (prev) => {
        return {
          ...prev,
          formSelectionMode: 'name',
          entityReferenceType: 'Quickview',
          quickviewWidth: 600,
          displayProperty: '',
          handleFail: false,
          handleSuccess: false,
          style: prev.style,
          stylingBox: prev.stylingBox,
        };
      })
      .add<IEntityReferenceControlProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IEntityReferenceControlProps>(2, (prev) => migrateVisibility(prev))
      .add<IEntityReferenceControlProps>(3, (prev) => ({
        ...prev,
        onSuccess: migrateNavigateAction(prev.onSuccess),
        onFail: migrateNavigateAction(prev.onFail),
      }))
      .add<IEntityReferenceControlProps>(4, (prev) => migrateReadOnly(prev, 'editable'))
      .add<IEntityReferenceControlProps>(5, (prev, context) => ({
        ...prev,
        footerButtons: context.isNew ? 'default' : (prev.footerButtons ?? prev.showModalFooter) ? 'default' : 'none',
      }))
      .add<IEntityReferenceControlProps>(6, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) }))
      .add<IEntityReferenceControlProps>(7, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
      .add<IEntityReferenceControlProps>(8, (prev) => ({
        ...prev,
        iconName: (prev?.iconName as ShaIconTypes) ?? (prev?.icon as ShaIconTypes),
      })),
  linkToModelMetadata: (model, propMetadata): IEntityReferenceControlProps => {
    return {
      ...model,
      entityType: isEntityReferencePropertyMetadata(propMetadata) ? propMetadata.entityType : undefined,
    };
  },
};

export default EntityReferenceComponent;
