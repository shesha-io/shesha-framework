/**
 * Modal API type definitions for code editor IntelliSense
 * This file provides TypeScript type definitions for the modal API exposed to scripts
 */

export const modalApiDefinition = `
/**
 * Form identifier - can be a string path or an object with name and module
 */
export type FormIdentifier = string | { name: string; module?: string };

/**
 * Form mode type
 */
export type FormMode = 'readonly' | 'edit' | 'designer';

/**
 * Modal width presets
 */
export type ModalWidth = 'small' | 'medium' | 'large' | 'full' | string;

/**
 * Arguments for showing a form in a modal
 */
export interface ShowFormModalArgs {
  /** Form identifier to display in the modal */
  formId: FormIdentifier;
  /** Modal title */
  title?: string;
  /** Modal width (can be a preset or custom value like '60%' or '800px') */
  width?: ModalWidth;
  /** Form mode - defaults to 'edit' */
  mode?: FormMode;
  /** Arguments to pass to the form */
  formArguments?: Record<string, unknown>;
  /** Initial values for the form */
  initialValues?: Record<string, unknown>;
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
 * Discriminated union for modal content types
 */
export type ModalContent = {
  type: 'text';
  value: string;
} | {
  type: 'html';
  value: string;
} | {
  type: 'node';
  value: any; // ReactNode not available in script context
};

/**
 * Arguments for custom content modals
 */
export interface ShowContentModalArgs {
  /** Modal title */
  title?: string;
  /**
   * Modal content - can be:
   * - ModalContent discriminated union (recommended):
   *   - { type: 'text', value: 'Plain text content' } - renders as plain text
   *   - { type: 'html', value: '<strong>HTML content</strong>' } - renders as sanitized HTML
   *   - { type: 'node', value: reactNode } - renders a React node
   * - string (backward compatible) - renders as plain text
   */
  content: ModalContent | string;
  /** Modal width */
  width?: ModalWidth;
  /** Show close icon in modal header */
  showCloseIcon?: boolean;
  /**
   * Custom footer content - same format as content:
   * - ModalContent discriminated union (recommended)
   * - string (backward compatible) - renders as plain text
   */
  footer?: ModalContent | string;
}

/**
 * Modal API interface - provides methods for displaying dialogs
 */
export interface ModalApi {
  /**
   * Show a form in a modal dialog
   * @param args - Configuration for the form modal
   * @returns Promise that resolves with form values on submit, or rejects on cancel
   * @example
   * // Show a validation form
   * const result = await modal.showForm({
   *   formId: { name: 'validation-form', module: 'app' },
   *   title: 'Validation Required',
   *   width: '60%'
   * });
   *
   * @example
   * // Show a readonly form
   * await modal.showForm({
   *   formId: 'my-form',
   *   mode: 'readonly',
   *   initialValues: data
   * });
   */
  showForm: <T = unknown>(args: ShowFormModalArgs) => Promise<T>;

  /**
   * Show a confirmation dialog (Yes/No)
   * @param args - Configuration for the confirmation dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   * @example
   * const confirmed = await modal.confirm({
   *   title: 'Delete Item',
   *   content: 'Are you sure you want to delete this item? This action cannot be undone.',
   *   okText: 'Delete',
   *   cancelText: 'Cancel'
   * });
   * if (confirmed) {
   *   // Proceed with deletion
   * }
   */
  confirm: (args: ConfirmModalArgs) => Promise<boolean>;

  /**
   * Show a warning dialog
   * @param args - Configuration for the warning dialog
   * @returns Promise that resolves when dialog is closed
   * @example
   * await modal.warning({
   *   title: 'Validation Failed',
   *   content: 'Please correct the errors before proceeding.'
   * });
   */
  warning: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show an info dialog
   * @param args - Configuration for the info dialog
   * @returns Promise that resolves when dialog is closed
   * @example
   * await modal.info({
   *   title: 'Information',
   *   content: 'Your changes have been saved successfully.'
   * });
   */
  info: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show an error dialog
   * @param args - Configuration for the error dialog
   * @returns Promise that resolves when dialog is closed
   * @example
   * await modal.error({
   *   title: 'Error',
   *   content: 'An error occurred while processing your request.'
   * });
   */
  error: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show a success dialog
   * @param args - Configuration for the success dialog
   * @returns Promise that resolves when dialog is closed
   * @example
   * await modal.success({
   *   title: 'Success',
   *   content: 'The operation completed successfully.'
   * });
   */
  success: (args: AlertModalArgs) => Promise<void>;

  /**
   * Show a modal with custom content
   * @param args - Configuration for the custom content modal
   * @returns Promise that resolves when dialog is closed
   * @example
   * // Plain text (recommended for simple text)
   * await modal.showContent({
   *   title: 'Text Dialog',
   *   content: { type: 'text', value: 'This is plain text. <tags> are shown literally.' }
   * });
   *
   * @example
   * // HTML content (when you need formatted HTML)
   * await modal.showContent({
   *   title: 'HTML Dialog',
   *   content: { type: 'html', value: '<div><strong>Bold</strong> and <em>italic</em> text</div>' },
   *   width: '800px'
   * });
   *
   * @example
   * // Backward compatible (string treated as plain text)
   * await modal.showContent({
   *   title: 'Simple Dialog',
   *   content: 'Plain text content'
   * });
   */
  showContent: <T = unknown>(args: ShowContentModalArgs) => Promise<T>;
}
`;
