import React, { useEffect, useRef } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { TableOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { Alert } from 'antd';
import { ChildTable, IChildTableProps } from '../../../../';
import { useForm } from '../../../../providers/form';
import { DataTableFullInstance } from '../../../../providers/dataTable/contexts';
import { useDataTableState } from '../../../../providers';
import DataTableProvider from '../../../../providers/dataTable';
import { evaluateValue, validateConfigurableComponentSettings } from '../../../../providers/form/utils';

export interface IChildDataTableProps extends IConfigurableFormComponent {
  entityType: string;
  parentEntityId?: string;
}

const settingsForm = settingsFormJson as FormMarkup;

const ChildDataTableComponent: IToolboxComponent<IChildDataTableProps> = {
  type: 'childDataTable',
  name: 'Child DataTable',
  icon: <TableOutlined />,
  factory: (model: IChildDataTableProps) => {
    const {
      entityType,
      parentEntityId,
      label,
    } = model;
    
    const { isComponentHidden, formData } = useForm();

    const tableRef = useRef<DataTableFullInstance>(null);
    const { registerActions } = useForm();

    useEffect(
      () =>
        registerActions(model.id, {
          refresh: () => {
            tableRef.current?.refreshTable();
          },
        }),
      []
    );

    const tableProps: IChildTableProps = {
      header: label,
    };

    const { parentEntityId: currentParentEntityId } = useDataTableState();

    if (!entityType) return <Alert message="Child DataTable is not configured properly" type="warning" showIcon />;

    const evaluatedParentEntityId = evaluateValue(parentEntityId, { data: formData });

    if (isComponentHidden(model)) return null;

    return (
      <DataTableProvider 
        entityType={entityType}
        parentEntityId={currentParentEntityId || evaluatedParentEntityId}
      >
        <ChildTable {...tableProps} tableRef={tableRef} />
      </DataTableProvider>
    );
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  initModel: model => {
    const response: IChildDataTableProps = {
      ...model,
      parentEntityId: '{data.id}',
    };

    return response;
  },
};

export default ChildDataTableComponent;
