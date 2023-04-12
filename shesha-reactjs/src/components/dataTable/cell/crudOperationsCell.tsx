import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { useCrud } from 'providers/crudContext';
import { ITableCrudOperationsColumn } from 'providers/dataTable/interfaces';
import React, { FC, useMemo } from 'react';
import { IHasColumnConfig } from './interfaces';
import ValidationErrorsIcon from './validationErrorsIcon/validationErrorsIcon';

export interface ICrudOperationsCellProps extends IHasColumnConfig<ITableCrudOperationsColumn> {
}

interface IActionButtonProps {
  title: string;
  icon?: React.ReactNode;
  executer: () => void;
  confirmationText?: string;
  isVisible: boolean;
}

const ActionButton: FC<IActionButtonProps> = ({ icon, title, executer, confirmationText }) => {
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
      style={{ margin: '0 5px' }}
    />
  );
  /*
  <a className="sha-link" onClick={e => onCancelEditClick(e)} title="Reset">
      <CloseOutlined />
    </a>  
  */
  return confirmationText
    ? <Popconfirm title={confirmationText} onConfirm={() => executer()}>{button}</Popconfirm>
    : button;
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
    lastError,
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
        isVisible: isNewObject
      },
      {
        title: "Reset",
        executer: onCancelEditClick,
        icon: <CloseOutlined />,
        isVisible: isNewObject
      },
      {
        title: "Edit",
        executer: onEditClick,
        icon: <EditOutlined />,
        isVisible: allowEdit && mode === 'read'
      },
      {
        title: "Delete",
        confirmationText: 'Are you sure want to delete this item?',
        executer: onDeleteClick,
        icon: <DeleteOutlined />,
        isVisible: allowDelete && mode === 'read'
      },
      {
        title: "Save",
        executer: onSaveUpdateClick,
        icon: <SaveOutlined />,
        isVisible: allowEdit && mode === 'update'
      },
      {
        title: "Cancel edit",
        executer: onCancelEditClick,
        icon: <CloseOutlined />,
        isVisible: allowEdit && mode === 'update'
      },
    ];
    return allButtons.filter(b => b.isVisible);
  }, [isNewObject, allowDelete, allowEdit, mode]);

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      {buttons.map((btn, idx) => (<ActionButton {...btn} key={idx} />))}
      <ValidationErrorsIcon error={lastError} />
    </div>
  );
};

export default CrudOperationsCell;