import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Popover } from 'antd';
import { IErrorInfo } from 'interfaces/errorInfo';
import { useCrud } from 'providers/crudContext';
import { ITableCrudOperationsColumn } from 'providers/dataTable/interfaces';
import React, { FC, useMemo } from 'react';
import { IHasColumnConfig } from './interfaces';

export interface ICrudOperationsCellProps extends IHasColumnConfig<ITableCrudOperationsColumn> {
}

interface IActionButtonProps {
  title: string;
  icon?: React.ReactNode;
  executer: () => void;
  confirmationText?: string;
  isVisible: boolean;
  loading?: boolean;
  error?: IErrorInfo;
}

const ActionButton: FC<IActionButtonProps> = ({ icon, title, executer, confirmationText, loading, error }) => {
  const mustConfirm = Boolean(confirmationText);
  const button = (
    <Button
      shape="circle"
      icon={icon}
      onClick={mustConfirm
        ? undefined
        : e => {
          e.stopPropagation();
          executer();
        }}
      title={title}
      size='small'
      style={{ margin: '0 3px' }}
      loading={loading}
      danger={Boolean(error)}
    />
  );

  const withConfirmation = confirmationText
    ? <Popconfirm title={confirmationText} onConfirm={() => executer()}>{button}</Popconfirm>
    : button;

  return error
    ? (
      <Popover
        title={error.message}
        content={
          <>{error.details}</>
        }
        trigger="hover"
        placement="topLeft"
      >
        {withConfirmation}
      </Popover>
    )
    : <>{withConfirmation}</>;
};

export const CrudOperationsCell = (_props: ICrudOperationsCellProps) => {

  const {
    mode,
    switchMode,
    performCreate,
    performUpdate,
    performDelete,
    reset,
    isNewObject,
    allowEdit,
    allowDelete,
    saveError,
    allowChangeMode,
    autoSave,
    isSaving,
    isDeleting,
    deletingError,
  } = useCrud();

  const onEditClick = () => {
    switchMode('update');
  };

  const onSaveUpdateClick = async () => {
    try {
      await performUpdate();
      switchMode('read');
    } catch (error) {
      console.log('Update failed: ', error);
    }
  };

  const onSaveCreateClick = async () => {
    try {
      await performCreate();
      await reset();
    } catch (error) {
      console.log('Create failed: ', error);
    }
  };

  const onCancelEditClick = async () => {
    await reset();
    switchMode('read');
  };

  const onDeleteClick = () => {
    performDelete();
  };

  const buttons = useMemo<IActionButtonProps[]>(() => {
    const allButtons: IActionButtonProps[] = [
      {
        title: "Add",
        executer: onSaveCreateClick,
        icon: <PlusOutlined />,
        isVisible: isNewObject,
        loading: isSaving,
        error: saveError,
      },
      {
        title: "Edit",
        executer: onEditClick,
        icon: <EditOutlined />,
        isVisible: allowEdit && mode === 'read'
      },
      {
        title: "Save",
        executer: () => { 
          onSaveUpdateClick(); 
        },
        icon: <SaveOutlined />,
        isVisible: /*!autoSave &&*/ allowEdit && mode === 'update',
        loading: isSaving,
        error: saveError,
      },
      {
        title: "Cancel edit",
        executer: () => {
          onCancelEditClick(); 
        },
        icon: <CloseOutlined />,
        isVisible: /*!autoSave &&*/ (allowEdit && mode === 'update' && allowChangeMode)
      },
      {
        title: "Reset",
        executer: () => { 
          onCancelEditClick(); 
        },
        icon: <CloseOutlined />,
        isVisible: /*!autoSave &&*/ (isNewObject || allowEdit && mode === 'update' && !allowChangeMode)
      },
      {
        title: "Delete",
        confirmationText: 'Are you sure want to delete this item?',
        executer: onDeleteClick,
        icon: <DeleteOutlined />,
        isVisible: allowDelete && (mode === 'read' || mode === 'update' && !allowChangeMode),
        loading: isDeleting,
        error: deletingError,
      },
    ];
    return allButtons.filter(b => b.isVisible);
  }, [isNewObject, allowDelete, allowEdit, mode, performCreate, allowChangeMode, autoSave, isSaving, saveError, isDeleting, deletingError]);

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      {buttons.map((btn, idx) => (<ActionButton {...btn} key={idx} />))}
    </div>
  );
};

export default CrudOperationsCell;