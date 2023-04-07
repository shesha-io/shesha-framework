import { LayoutOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { MetadataProvider, useDataTableStore, useForm } from '../../../../../providers';
import DataTableProvider from '../../../../../providers/dataTable';
import { DataTableSelectionProvider, useDataTableSelection } from '../../../../../providers/dataTableSelection';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';
import ComponentsContainer from '../../../componentsContainer';
import ImportConfigModal from './modal/importConfigModal';
import settingsFormJson from './settingsForm.json';

export interface ITableContextComponentProps extends IConfigurableFormComponent {
  sourceType?: 'Form' | 'Entity' |'Url';
  entityType?: string;
  endpoint?: string;
  components?: IConfigurableFormComponent[]; // If isDynamic we wanna
}

const settingsForm = settingsFormJson as FormMarkup;

const TableContextComponent: IToolboxComponent<ITableContextComponentProps> = {
  type: 'datatableContext',
  name: 'DataTable Context',
  icon: <LayoutOutlined />,
  factory: (model: ITableContextComponentProps) => {
    return <TableContext {...model} />;
  },
  migrator: m => m.add<ITableContextComponentProps>(0, prev => {
    return {
      ...prev,
      name: prev['uniqueStateId'] ?? prev.name,
    };
  }).add<ITableContextComponentProps>(1, prev => {
    return {
      ...prev,
      sourceType: 'Entity'
    };
  }),
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export const TableContext: FC<ITableContextComponentProps> = props => {
  const [table, setTable] = useState(<></>);
  const { entityType } = props;

  useEffect(() => {
    const uniqueKey = `${props.sourceType}_${props.name}_${props.entityType ?? 'empty'}`; // is used just for re-rendering
    setTable(<TableContextInner key={uniqueKey} {...props} />);
  }, [props.entityType]);

  return entityType ? (
    <MetadataProvider id={props.id} modelType={entityType}>
      {table}
    </MetadataProvider>
  ) : (
    table
  );
};

export const TableContextInner: FC<ITableContextComponentProps> = props => {
  const { sourceType, entityType, endpoint, label, id, name } = props;
  const { formMode } = useForm();
  const [selectedRow, setSelectedRow] = useState(-1);
  const isDesignMode = formMode === 'designer';

  if (isDesignMode && ((sourceType === 'Entity' && !entityType) || (sourceType === 'Url' && !endpoint)))
    return (
      <Alert
        className="sha-designer-warning"
        message="Table is not configured"
        description={sourceType === 'Entity' ? "Select entity type on the settings panel" : "Select endpoint on the settings panel"}
        type="warning"
        showIcon
      />
    );

  const onSelectRow = index => {
    setSelectedRow(index);
  };

  const provider = <DataTableProvider
    userConfigId={props.id}
    entityType={entityType}
    getDataPath={endpoint}
    title={label}
    selectedRow={selectedRow}
    onSelectRow={onSelectRow}
    actionOwnerId={id}
    actionOwnerName={name}
    sourceType={props.sourceType}
  >
    <TableContextAccessor {...props} />
  </DataTableProvider>;

  const providerWrapper = sourceType === 'Form'
    ? <FormItem name={props.name}>
        {provider}
      </FormItem>
    : provider;


  return (
    <DataTableSelectionProvider>
      {providerWrapper}
    </DataTableSelectionProvider>
  );
};

const TableContextAccessor: FC<ITableContextComponentProps> = ({ id }) => {
  const { registerActions } = useForm();
  const { refreshTable, exportToExcel, tableConfigLoaded, setIsInProgressFlag } = useDataTableStore();
  const { selectedRow } = useDataTableSelection();

  const [{ visible }, setState] = useState({ visible: false });

  const deleteRow = () => {
    console.log(`deleteRow ${selectedRow.id}`);
  };

  const toggleColumnsSelector = () => {
    setIsInProgressFlag({ isSelectingColumns: true, isFiltering: false });
  };

  const toggleAdvancedFilter = () => {
    setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });
  };

  const importConfigs = () => setState(s => ({ ...s, visible: true }));

  // register available actions, refresh on every table configuration loading or change of the table Id
  useEffect(
    () =>
      registerActions(id, {
        refresh: refreshTable,
        toggleColumnsSelector,
        toggleAdvancedFilter,
        exportToExcel,
        deleteRow,
        importConfigs,
      }),
    [tableConfigLoaded, selectedRow]
  );

  return (
    <Fragment>
      <ComponentsContainer
        containerId={id}
        // dynamicComponents={isDynamic ? components : []}
      />

      <ImportConfigModal
        visible={visible}
        onRefresh={refreshTable}
        onCancel={() => setState(s => ({ ...s, visible: false }))}
      />
    </Fragment>
  );
};

export default TableContextComponent;
