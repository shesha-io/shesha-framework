import React, { FC, useState } from 'react';
import { GenericCreateModal, IGenericCreateModalProps, Page, Show } from '../';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import IndexTableFull, { IIndexTableFullProps } from '../indexTableFull';
import { IToolbarItem } from '../../interfaces';
import DataTableProvider from '../../providers/dataTable';
import { useDataTableStore } from '../../providers';
import { notification } from 'antd';
import { TableColumnsFluentSyntax } from '../../providers/dataTable/interfaces';
import { useDataTableFluentColumns } from '../../hooks';

export interface IGenericIndexPageProps {
  /**
   * Page title
   */
  title: string;

  /** 
   * Type of entity 
   */
  entityType: string;
  /**
   * Columns fluent syntax
   */
  columns: TableColumnsFluentSyntax;

  /**
   * A callback for redirecting the user to the details page of the modal
   */
  detailsUrl?: (id: string) => string;

  /**
   * A callback for redirecting the user to the edit page of the modal
   */
  editUrl?: (id: string) => string;

  /**
   * The props for the modal used to add an entity
   */
  createModalProps?: IGenericCreateModalProps | null;

  /**
   * A callback for when the file export has succeeded
   */
  onExportSuccess?: () => void;

  tableProps?: Omit<IIndexTableFullProps, 'id'>;
}

const TableWithControls: FC<IGenericIndexPageProps> = props => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);

  const { refreshTable } = useDataTableStore();

  const toolbarItems: IToolbarItem[] = [];

  if (props.createModalProps)
    toolbarItems.push({
      title: 'Create New',
      icon: <PlusOutlined />,
      onClick: () => setCreateModalVisible(true),
    });

  const handleEntityCreated = (form: FormInstance, keepModalOpenAfterSave: boolean) => {
    if (!keepModalOpenAfterSave) {
      setCreateModalVisible(false);
    } else {
      notification.success({
        message: 'Success',
        description: 'Data has successfully been saved.',
      });
    }

    form.resetFields();

    refreshTable();
  };

  const handleCancel = (form: FormInstance) => {
    setCreateModalVisible(false);
    form.resetFields();
  };

  const extraTableProps = { ...(props?.tableProps || {}) };
  delete extraTableProps.tableRef;

  return (
    <Page noPadding>
      <IndexTableFull
        // entityType={props.entityType}
        // configurableColumns={configurableColumns}
        header={props.title}
        actionColumns={[
          { icon: <SearchOutlined />, onClick: props.detailsUrl },
          { icon: <EditOutlined />, onClick: props.editUrl },
        ]}
        tableRef={props?.tableProps?.tableRef}
        {...extraTableProps}
        toolbarItems={[...toolbarItems, ...(props?.tableProps?.toolbarItems || [])]}
      />

      <Show when={!!props.createModalProps}>
        <GenericCreateModal
          visible={createModalVisible}
          title="Create"
          onCancel={handleCancel}
          onSuccess={handleEntityCreated}
          {...props.createModalProps}
        />
      </Show>
    </Page>
  );
};

const GenericIndexPagePlain: FC<IGenericIndexPageProps> = props => {
  const configurableColumns = useDataTableFluentColumns(props.columns);
  return (
    <DataTableProvider
      entityType={props.entityType}
      configurableColumns={configurableColumns}
    >
      <TableWithControls {...props} />
    </DataTableProvider>
  );
};

export default GenericIndexPagePlain;
