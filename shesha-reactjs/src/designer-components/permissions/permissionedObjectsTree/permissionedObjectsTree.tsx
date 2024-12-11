import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { ApartmentOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import PermissionedObjectsTree from '@/components/permissionedObjectsTree';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { IConfigurableActionConfiguration } from '@/index';

export interface IPermissionedObjectsTreeComponentProps extends IConfigurableFormComponent { 
  objectsType?: string;
  height?: string;

  /**
   * A callback for when the value of this component changes
   */
   onChange?: any;

   onSelectAction?: IConfigurableActionConfiguration;

   defaultAccess?: number;
}

const settingsForm = settingsFormJson as FormMarkup;

const PermissionedObjectsTreeComponent: IToolboxComponent<IPermissionedObjectsTreeComponentProps> = {
  type: 'permissionedObjectsTree',
  isInput: false,
  name: 'Permissioned objects tree',
  icon: <ApartmentOutlined />,
  Factory: ({ model }) => {
    return (
      <PermissionedObjectsTree {...model} formComponentId={model.id} formComponentName={model.componentName}/>
    );
  },
  initModel: (model: IPermissionedObjectsTreeComponentProps) => {
    return {
      ...model,
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  linkToModelMetadata: (model): IPermissionedObjectsTreeComponentProps => {
    return {
      ...model,
    };
  },
  migrator: (m) => m
    .add<IPermissionedObjectsTreeComponentProps>(0, (prev) => ({...migrateFormApi.eventsAndProperties(prev)}))
  ,
};

export default PermissionedObjectsTreeComponent;
