import { CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { useDataListCrud } from '@/providers/dataListCrudContext/index';
import ActionButton, { IActionButtonProps } from '../actionButton/index';

export const CrudActionButtons = () => {
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
  } = useDataListCrud();

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
        title: 'Add',
        executer: onSaveCreateClick,
        icon: <PlusCircleOutlined />,
        isVisible: isNewObject,
        loading: isSaving,
        error: saveError,
      },
      {
        title: 'Edit',
        executer: onEditClick,
        icon: <EditOutlined />,
        isVisible: allowEdit && mode === 'read',
      },
      {
        title: 'Save',
        executer: () => {
          onSaveUpdateClick();
        },
        icon: <SaveOutlined />,
        isVisible: /*!autoSave &&*/ allowEdit && mode === 'update',
        loading: isSaving,
        error: saveError,
      },
      {
        title: 'Cancel edit',
        executer: () => {
          onCancelEditClick();
        },
        icon: <CloseCircleOutlined />,
        isVisible: /*!autoSave &&*/ allowEdit && mode === 'update' && allowChangeMode,
      },
      {
        title: 'Reset',
        executer: () => {
          onCancelEditClick();
        },
        icon: <CloseCircleOutlined />,
        isVisible: /*!autoSave &&*/ isNewObject || (allowEdit && mode === 'update' && !allowChangeMode),
      },
      {
        title: 'Delete',
        confirmationText: 'Are you sure want to delete this item?',
        executer: onDeleteClick,
        icon: <DeleteOutlined />,
        isVisible: allowDelete && (mode === 'read' || (mode === 'update' && !allowChangeMode)),
        loading: isDeleting,
        error: deletingError,
      },
    ];
    return allButtons.filter((b) => b.isVisible);
  }, [
    isNewObject,
    allowDelete,
    allowEdit,
    mode,
    performCreate,
    allowChangeMode,
    autoSave,
    isSaving,
    saveError,
    isDeleting,
    deletingError,
  ]);

  return (
    <div className="sha-datalist-component-item-checkbox">
      {buttons.map((btn, idx) => (
        <ActionButton {...btn} key={idx} />
      ))}
    </div>
  );
};

export default CrudActionButtons;
