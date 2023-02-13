import { IToolboxComponent } from '../../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { ApartmentOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';
import PermissionedObjectsTree from '../../../../permissionedObjectsTree';

export interface IPermissionedObjectsTreeComponentProps extends IConfigurableFormComponent { 
  objectsType?: string;

  /**
   * A callback for when the value of this component changes
   */
   onChange?: any;
}

const settingsForm = settingsFormJson as FormMarkup;

const PermissionedObjectsTreeComponent: IToolboxComponent<IPermissionedObjectsTreeComponentProps> = {
  type: 'permissionedObjectsTree',
  name: 'Permissioned objects tree',
  icon: <ApartmentOutlined />,
  factory: (model: IPermissionedObjectsTreeComponentProps) => {
    return (
      <PermissionedObjectsTree {...model}/>
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
};

export default PermissionedObjectsTreeComponent;
