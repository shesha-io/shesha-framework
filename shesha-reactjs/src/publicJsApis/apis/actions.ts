import { HttpClientApi } from "./httpClient";
import { MessageApi } from "./message";
import { ConfirmModalArgs, ShowFormModalArgs } from "./modal";

export type FormIdentifier = string | { name: string; module: string | null };

export interface IActionsApi {
  /** Http Client */
  readonly callApi: HttpClientApi;
  /** Message Api */
  readonly showMessage: MessageApi;
  /**
   * Show a confirmation dialog (Yes/No)
   * @param args - Configuration for the confirmation dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   * @example
   * const confirmed = await modal.showConfirmation({
   *   title: 'Delete Item',
   *   content: 'Are you sure you want to delete this item? This action cannot be undone.',
   *   okText: 'Delete',
   *   cancelText: 'Cancel'
   * });
   * if (confirmed) {
   *   // Proceed with deletion
   * }
   */
  showConfirmation: (args: ConfirmModalArgs) => Promise<boolean>;
  /**
   * Show a form in a modal dialog
   * @param args - Configuration for the form modal
   * @returns Promise that resolves with form values on submit, or rejects on cancel
   * @example
   * // Show a validation form
   * const result = await modal.showDialog({
   *   formId: { name: 'validation-form', module: 'app' },
   *   title: 'Validation Required',
   *   width: '60%'
   * });
   *
   * @example
   * // Show a readonly form
   * await modal.showDialog({
   *   formId: 'my-form',
   *   mode: 'readonly',
   *   initialValues: data
   * });
   */
  showDialog: <T = unknown>(args: ShowFormModalArgs) => Promise<T>;
  /**
   * Navigate to the given url
   */
  navigateToUrl?: ((url: string, queryParameters?: Record<string, string>) => void) | undefined;
  /**
   * Navigate to the given form
   */
  navigateToForm?: ((formId: FormIdentifier, args?: Record<string, string>) => void) | undefined;
}
