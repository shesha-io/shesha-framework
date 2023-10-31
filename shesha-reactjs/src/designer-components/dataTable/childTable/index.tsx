import { TableOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { MutableRefObject } from 'react';
import { validateConfigurableComponentSettings } from '../../../formDesignerUtils';
import { IConfigurableFormComponent, IToolboxComponent } from '../../../interfaces';
import { useDataTableStore } from '../../../providers';
import { FormMarkup } from '../../../providers/form/models';
import { ChildTable } from './childTable';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateV2toV3 } from './migrations/migrate-v3';
import { IChildTableSettingsProps } from './models';
import ChildDataTableSettings from './settings';
import settingsFormJson from './settingsForm.json';
import './styles/index.less';
import { migrateCustomFunctions, migratePropertyName } from '../../../designer-components/_common-migrations/migrateSettings';

export interface IChildTableComponentProps extends IChildTableSettingsProps, IConfigurableFormComponent {
  components?: IConfigurableFormComponent[];
}

const settingsForm = settingsFormJson as FormMarkup;

const ChildTableComponent: IToolboxComponent<IChildTableComponentProps> = {
  type: 'childTable',
  name: 'Child Table',
  icon: <TableOutlined />,
  factory: (model: IChildTableComponentProps, componentRef: MutableRefObject<any>) => {
    const store = useDataTableStore(false);

    return store ? (
      <ChildTable {...model} componentRef={componentRef} />
    ) : (
      <Alert
        className="sha-designer-warning"
        message="Child Table must be used within a Data Table Context"
        type="warning"
      />
    );
  },

  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <ChildDataTableSettings
        readOnly={readOnly}
        model={model as unknown as IChildTableSettingsProps}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  migrator: (m) =>
    m
      .add<IChildTableComponentProps>(0, (prev) => {
        return {
          ...prev,
          isNotWrapped: prev['isNotWrapped'] ?? true,
          defaultSelectedFilterId: null,
        };
      })
      .add<IChildTableComponentProps>(1, migrateV0toV1)
      .add<IChildTableComponentProps>(2, migrateV1toV2)
      .add<IChildTableComponentProps>(3, migrateV2toV3)
      .add(4, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default ChildTableComponent;
