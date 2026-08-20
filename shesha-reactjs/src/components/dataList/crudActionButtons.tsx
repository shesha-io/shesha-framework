import { useDataListCrud } from '@/providers/dataListCrudContext/index';
import { CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { App } from 'antd';
import * as React from 'react';
import { extractErrorInfo } from '@/utils/errors';
import ActionButton, { IActionButtonProps } from '../actionButton/index';
import ValidationErrors from '../validationErrors';
import { useStyles } from './styles/styles';

export const CrudActionButtons = (): React.JSX.Element => {
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
    isSaving,
    isDeleting,
    deletingError,
  } = useDataListCrud();

  const { styles } = useStyles();
  const { notification } = App.useApp();

  // the inline CRUD errors are otherwise only reachable by hovering the action button, so a failed
  // operation looks like nothing happened - surface it explicitly.
  const notifyError = (error: unknown, title: string): void => {
    console.error(title, error);
    notification.error({
      // `message` is deprecated in antd 6 in favour of `title`
      title,
      description: <ValidationErrors error={extractErrorInfo(error)} renderMode="raw" />,
    });
  };

  const onEditClick = (): void => {
    switchMode('update');
  };

  const onSaveUpdateClick = async (): Promise<void> => {
    try {
      await performUpdate();
      switchMode('read');
    } catch (error) {
      notifyError(error, 'Update failed');
    }
  };

  const onSaveCreateClick = async (): Promise<void> => {
    try {
      await performCreate();
    } catch (error) {
      notifyError(error, 'Create failed');
      return;
    }

    // The row exists by this point, so a `reset` failure must not be reported as a create failure -
    // the user would retry and create a duplicate.
    try {
      await reset();
    } catch (error) {
      notifyError(error, 'Failed to reset the form');
    }
  };

  const onCancelEditClick = async (): Promise<void> => {
    try {
      await reset();
    } catch (error) {
      // `reset` throws when there is no form in scope; without this the rejection escapes unhandled
      // and `switchMode` below never runs, leaving the row stuck in edit mode.
      notifyError(error, 'Failed to reset the form');
    }
    switchMode('read');
  };

  const onDeleteClick = (): void => {
    performDelete().catch((error) => {
      // don't rethrow - performDelete already recorded the error on the crud context, and rethrowing
      // here escapes as an unhandled promise rejection.
      notifyError(error, 'Failed to delete row');
    });
  };

  const buttons: IActionButtonProps[] = [
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
        void onSaveUpdateClick();
      },
      icon: <SaveOutlined />,
      isVisible: /* !autoSave &&*/ allowEdit && mode === 'update',
      loading: isSaving,
      error: saveError,
    },
    {
      title: 'Cancel edit',
      executer: () => {
        void onCancelEditClick();
      },
      icon: <CloseCircleOutlined />,
      isVisible: /* !autoSave &&*/ allowEdit && mode === 'update' && allowChangeMode,
    },
    {
      title: 'Reset',
      executer: () => {
        void onCancelEditClick();
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
  ].filter((b) => b.isVisible);

  return (
    <div className={styles.shaDatalistComponentItemCheckbox}>
      {buttons.map((btn, idx) => (
        <ActionButton {...btn} key={idx} type="default" shape="circle" />
      ))}
    </div>
  );
};

export default CrudActionButtons;
