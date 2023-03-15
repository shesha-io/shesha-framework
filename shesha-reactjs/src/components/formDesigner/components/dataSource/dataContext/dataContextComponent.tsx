import { LayoutOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { MetadataProvider, useDataTableStore, useForm } from '../../../../../providers';
import DataTableProvider from '../../../../../providers/dataTable';
import { DataTableSelectionProvider, useDataTableSelection } from '../../../../../providers/dataTableSelection';
import { FormMarkup, IConfigurableFormComponent } from '../../../../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../../../../providers/form/utils';
import ComponentsContainer from '../../../componentsContainer';
//import ImportConfigModal from './modal/importConfigModal';
import settingsFormJson from './settingsForm.json';

export interface IDataContextComponentProps extends IConfigurableFormComponent {
  entityType?: string;
  endpoint?: string;
  components?: IConfigurableFormComponent[]; // If isDynamic we wanna
}

const settingsForm = settingsFormJson as FormMarkup;

const DataContextComponent: IToolboxComponent<IDataContextComponentProps> = {
  type: 'dataContext',
  name: 'Data Context',
  icon: <LayoutOutlined />,
  factory: (model: IDataContextComponentProps) => {
    return <DataContext {...model} />;
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export const DataContext: FC<IDataContextComponentProps> = props => {
  const [ content, setContent ] = useState(<></>);
  const { entityType } = props;

  useEffect(() => {
    const uniqueKey = `${props.entityType ?? 'empty'}`; // is used just for re-rendering
    setContent(<DataContextInner key={uniqueKey} {...props} />);
  }, [props.entityType]);

  return entityType ? (
    <MetadataProvider id={props.id} modelType={entityType}>
      {content}
    </MetadataProvider>
  ) : (
    content
  );
};

export const DataContextInner: FC<IDataContextComponentProps> = props => {
  const { entityType, endpoint, label, id, name } = props;
  const { formMode } = useForm();
  const [selectedRow, setSelectedRow] = useState(-1);
  const isDesignMode = formMode === 'designer';

  if (isDesignMode && !entityType)
    return (
      <Alert
        className="sha-designer-warning"
        message="DataSource is not configured"
        description="Select entity type on the settings panel"
        type="warning"
        showIcon
      />
    );

  const onSelectRow = index => {
    setSelectedRow(index);
  };

  return (
    <DataTableSelectionProvider>
      <DataTableProvider
        userConfigId={props.id}
        entityType={entityType}
        getDataPath={endpoint}
        title={label}
        selectedRow={selectedRow}
        onSelectRow={onSelectRow}
        actionOwnerId={id}
        actionOwnerName={name}
      >
        <DataContextAccessor {...props} />
      </DataTableProvider>
    </DataTableSelectionProvider>
  );
};

const DataContextAccessor: FC<IDataContextComponentProps> = ({ id }) => {
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

  const setToEditMode = () => {};

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
        setToEditMode,
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

      {/*<ImportConfigModal
        visible={visible}
        onRefresh={refreshTable}
        onCancel={() => setState(s => ({ ...s, visible: false }))}
      />*/}
    </Fragment>
  );
};

export default DataContextComponent;
