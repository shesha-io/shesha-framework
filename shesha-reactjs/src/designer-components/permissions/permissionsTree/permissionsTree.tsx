import { IToolboxComponent } from '@/interfaces';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { ApartmentOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import React from 'react';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { PermissionsTree, PermissionsTreeMode } from '@/components/permissionsTree';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { IConfigurableActionConfiguration } from '@/index';

export interface IPermissionsTreeComponentProps extends IConfigurableFormComponent {
  value?: string[];
  updateKey?: string;
  onChange?: (values?: string[]) => void;
  /**
   * Whether this control is disabled
   */
  disabled?: boolean;
  /**
   * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
   */
  readOnly?: boolean;
  height?: number;
  mode: PermissionsTreeMode;

  onSelectAction?: IConfigurableActionConfiguration;
}

const settingsForm = settingsFormJson as FormMarkup;

const PermissionedObjectsTreeComponent: IToolboxComponent<IPermissionsTreeComponentProps> = {
  type: 'permissionsTree',
  name: 'Permissions tree',
  icon: <ApartmentOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    if (model.mode === 'Edit') {
      return (
        <PermissionsTree
          onSelectAction={model.onSelectAction}
          formComponentId={model?.id}
          formComponentName={model.componentName}
          value={model?.value}
          updateKey={model?.updateKey}
          onChange={model?.onChange}
          readOnly={model?.readOnly}
          mode={model?.mode ?? "Select"}
          height={model?.height}
        />
      );
    } else {
      return (
        <ConfigurableFormItem model={model}>
          {(value, onChange) => (
            <PermissionsTree
              onSelectAction={model.onSelectAction}
              formComponentId={model?.id}
              formComponentName={model.componentName}
              value={value}
              updateKey={model?.updateKey}
              onChange={onChange}
              readOnly={model?.readOnly}
              mode={model?.mode ?? "Select"}
              height={model?.height}
            />
          )}
        </ConfigurableFormItem>
      );
    };
  },
  initModel: (model: IPermissionsTreeComponentProps) => {
    return {
      ...model,
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  linkToModelMetadata: (model): IPermissionsTreeComponentProps => {
    return {
      ...model,
    };
  },
  migrator: (m) => m
    .add<IPermissionsTreeComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IPermissionsTreeComponentProps)
    .add<IPermissionsTreeComponentProps>(1, (prev) => migrateReadOnly(prev))
    .add<IPermissionsTreeComponentProps>(2, (prev) => ({ ...migrateFormApi.eventsAndProperties(prev) })),
};

export default PermissionedObjectsTreeComponent;
