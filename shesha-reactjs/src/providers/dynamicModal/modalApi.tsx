import { Modal as AntModal, App } from 'antd';
import { nanoid } from '@/utils/uuid';
import { FormIdentifier, FormMode } from '../form/models';
import { IModalProps } from './models';
import { ModalFuncProps } from 'antd/lib/modal';

/**
 * Form identifier - can be a string path or an object with name and module
 */
export type FormIdentifierType = FormIdentifier;

/**
 * Modal width presets
 */
export type ModalWidth = 'small' | 'medium' | 'large' | 'full' | string;

/**
 * Arguments for showing a form in a modal
 */
export interface ShowFormModalArgs {
  /** Form identifier to display in the modal */
  formId: FormIdentifierType;
  /** Modal title */
  title?: string;
  /** Modal width (can be a preset or custom value like '60%' or '800px') */
  width?: ModalWidth;
  /** Form mode - defaults to 'edit' */
  mode?: FormMode;
  /** Arguments to pass to the form */
  formArguments?: any;
  /** Initial values for the form */
  initialValues?: any;
  /** Show close icon in modal header */
  showCloseIcon?: boolean;
  /** Footer buttons configuration */
  footerButtons?: 'default' | 'custom' | 'none';
}

/**
 * Arguments for confirmation dialogs
 */
export interface ConfirmModalArgs {
  /** Dialog title */
  title?: string;
  /** Dialog content/message */
  content: string;
  /** OK button text - defaults to 'Yes' */
  okText?: string;
  /** Cancel button text - defaults to 'No' */
  cancelText?: string;
  /** OK button type - defaults to 'primary' */
  okType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

/**
 * Arguments for warning/info dialogs
 */
export interface AlertModalArgs {
  /** Dialog title */
  title?: string;
  /** Dialog content/message */
  content: string;
  /** Button text - defaults to 'OK' */
  okText?: string;
}

/**
 * Arguments for custom content modals
 */
export interface ShowContentModalArgs {
  /** Modal title */
  title?: string;
  /** Modal content (HTML string or React elements) */
  content: any;
  /** Modal width */
  width?: ModalWidth;
  /** Show close icon in modal header */
  showCloseIcon?: boolean;
  /** Custom footer content */
  footer?: any;
}

/**
 * Modal API interface - provides methods for displaying dialogs
 */
export interface IModalApi {
  /**
   * Show a form in a modal dialog
   */
  showForm: <T = any>(args: ShowFormModalArgs) => Promise<T>;

  /**
   * Show a confirmation dialog (Yes/No)
   */
  confirm: (args: ConfirmModalArgs) => Promise<boolean>;

  /**
   * Show a warning dialog
   */
  warning: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show an info dialog
   */
  info: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show an error dialog
   */
  error: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show a success dialog
   */
  success: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show a modal with custom content
   */
  showContent: <T = any>(args: ShowContentModalArgs) => Promise<T>;
}

/**
 * Convert width preset to actual width value
 */
const getWidthFromPreset = (width?: ModalWidth): string | number | undefined => {
  if (!width) return undefined;

  const presets: Record<string, string> = {
    'small': '40%',
    'medium': '60%',
    'large': '80%',
    'full': '100%'
  };

  return presets[width] || width;
};

/**
 * Create a fallback modal API when DynamicModalProvider is not available
 * Only static methods (confirm, warning, info, error, success) are available
 * showForm and showContent will throw errors
 * @param modalApi - Ant Design modal API from App.useApp()
 */
export const createFallbackModalApi = (
  modalApi?: ReturnType<typeof App.useApp>['modal']
): IModalApi => {
  const notAvailableError = () => {
    throw new Error('showForm and showContent require DynamicModalProvider to be available in the component tree');
  };

  return {
    showForm: () => {
      notAvailableError();
      return Promise.reject(new Error('Modal API not available'));
    },
    showContent: () => {
      notAvailableError();
      return Promise.reject(new Error('Modal API not available'));
    },
    confirm: (args: ConfirmModalArgs): Promise<boolean> => {
      const { title = 'Confirm', content, okText = 'Yes', cancelText = 'No', okType = 'primary' } = args;
      return new Promise<boolean>((resolve) => {
        const config = {
          title,
          content,
          okText,
          cancelText,
          okType,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        };
        if (modalApi) {
          modalApi.confirm(config);
        } else {
          AntModal.confirm(config);
        }
      });
    },
    warning: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Warning', content, okText = 'OK' } = args;
      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = { title, content, okText, onOk: () => resolve() };
        if (modalApi) {
          modalApi.warning(config);
        } else {
          AntModal.warning(config);
        }
      });
    },
    info: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Information', content, okText = 'OK' } = args;
      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = { title, content, okText, onOk: () => resolve() };
        if (modalApi) {
          modalApi.info(config);
        } else {
          AntModal.info(config);
        }
      });
    },
    error: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Error', content, okText = 'OK' } = args;
      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = { title, content, okText, onOk: () => resolve() };
        if (modalApi) {
          modalApi.error(config);
        } else {
          AntModal.error(config);
        }
      });
    },
    success: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Success', content, okText = 'OK' } = args;
      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = { title, content, okText, onOk: () => resolve() };
        if (modalApi) {
          modalApi.success(config);
        } else {
          AntModal.success(config);
        }
      });
    },
  };
};

/**
 * Create Modal API instance
 * @param createModal - Function to create a modal from DynamicModalProvider
 * @param removeModal - Function to remove a modal from DynamicModalProvider
 * @param modalApi - Ant Design modal API from App.useApp()
 */
export const createModalApi = (
  createModal: (props: IModalProps) => void,
  removeModal: (id: string) => void,
  modalApi?: ReturnType<typeof App.useApp>['modal']
): IModalApi => {
  return {
    showForm: <T = any>(args: ShowFormModalArgs): Promise<T> => {
      const modalId = nanoid();
      const { formId, title, width, mode = 'edit', formArguments, initialValues, showCloseIcon = true, footerButtons = 'default' } = args;

      return new Promise<T>((resolve, reject) => {
        const modalProps: IModalProps = {
          id: modalId,
          formId,
          title,
          width: getWidthFromPreset(width),
          mode,
          formArguments,
          initialValues,
          isVisible: true,
          showCloseIcon,
          footerButtons,
          onSubmitted: (values: T) => {
            removeModal(modalId);
            resolve(values);
          },
          onCancel: () => {
            removeModal(modalId);
            reject(new Error('Modal cancelled'));
          },
          onClose: (positive = false, result?: T) => {
            removeModal(modalId);
            if (positive) {
              resolve(result as T);
            } else {
              reject(new Error('Modal closed'));
            }
          },
        };

        createModal(modalProps);
      });
    },

    confirm: (args: ConfirmModalArgs): Promise<boolean> => {
      const { title = 'Confirm', content, okText = 'Yes', cancelText = 'No', okType = 'primary' } = args;

      // Use Ant Design's modal API if available, otherwise use the static Modal.confirm
      if (modalApi) {
        return new Promise<boolean>((resolve) => {
          modalApi.confirm({
            title,
            content,
            okText,
            cancelText,
            okType,
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
      } else {
        return new Promise<boolean>((resolve) => {
          AntModal.confirm({
            title,
            content,
            okText,
            cancelText,
            okType,
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
      }
    },

    warning: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Warning', content, okText = 'OK' } = args;

      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = {
          title,
          content,
          okText,
          onOk: () => resolve(),
        };

        if (modalApi) {
          modalApi.warning(config);
        } else {
          AntModal.warning(config);
        }
      });
    },

    info: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Information', content, okText = 'OK' } = args;

      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = {
          title,
          content,
          okText,
          onOk: () => resolve(),
        };

        if (modalApi) {
          modalApi.info(config);
        } else {
          AntModal.info(config);
        }
      });
    },

    error: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Error', content, okText = 'OK' } = args;

      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = {
          title,
          content,
          okText,
          onOk: () => resolve(),
        };

        if (modalApi) {
          modalApi.error(config);
        } else {
          AntModal.error(config);
        }
      });
    },

    success: (args: AlertModalArgs): Promise<void> => {
      const { title = 'Success', content, okText = 'OK' } = args;

      return new Promise<void>((resolve) => {
        const config: ModalFuncProps = {
          title,
          content,
          okText,
          onOk: () => resolve(),
        };

        if (modalApi) {
          modalApi.success(config);
        } else {
          AntModal.success(config);
        }
      });
    },

    showContent: <T = any>(args: ShowContentModalArgs): Promise<T> => {
      const modalId = nanoid();
      const { title, content, width, showCloseIcon = true, footer } = args;

      return new Promise<T>((resolve, reject) => {
        const modalProps: IModalProps = {
          id: modalId,
          formId: '', // Empty formId since we're showing custom content
          title,
          width: getWidthFromPreset(width),
          isVisible: true,
          showCloseIcon,
          onCancel: () => {
            removeModal(modalId);
            reject(new Error('Modal cancelled'));
          },
          onClose: (positive = false, result?: T) => {
            removeModal(modalId);
            if (positive) {
              resolve(result as T);
            } else {
              reject(new Error('Modal closed'));
            }
          },
        };

        createModal(modalProps);
      });
    },
  };
};
