import { CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import React, { FC, useMemo } from 'react';
import { useCrud } from '@/providers/crudContext';
import ActionButton, { IActionButtonProps } from '@/components/actionButton/index';

export const CrudOperationsCell: FC = () => {
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

  const onEditClick = (): void => {
    switchMode('update');
  };

  const onSaveUpdateClick = async (): Promise<void> => {
    try {
      await performUpdate();
      switchMode('read');
    } catch (error) {
      console.error('Update failed: ', error);
    }
  };

  const onSaveCreateClick = async (): Promise<void> => {
    try {
      await performCreate();
      await reset();
    } catch (error) {
      console.error('Create failed: ', error);
    }
  };

  const onCancelEditClick = async (): Promise<void> => {
    await reset();
    switchMode('read');
  };

  const onDeleteClick = (): void => {
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
        isVisible: /* !autoSave &&*/ allowEdit && mode === 'update',
        loading: isSaving,
        error: saveError,
      },
      {
        title: 'Cancel edit',
        executer: () => {
          onCancelEditClick();
        },
        icon: <CloseCircleOutlined />,
        isVisible: /* !autoSave &&*/ allowEdit && mode === 'update' && allowChangeMode,
      },
      {
        title: 'Reset',
        executer: () => {
          onCancelEditClick();
        },
        icon: <CloseCircleOutlined />,
        isVisible: /* !autoSave &&*/ isNewObject || (allowEdit && mode === 'update' && !allowChangeMode),
      },
      {
        title: 'Delete',
        confirmationText: 'Are you sure you want to delete this item?',
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
    <div className="sha-crud-cell">
      {buttons.map((btn, idx) => (
        <ActionButton {...btn} key={idx} />
      ))}
    </div>
  );
};

export default CrudOperationsCell;
