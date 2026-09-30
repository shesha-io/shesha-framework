/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PageApi {
  /** page additional state (data) */
  readonly state: Record<string, any>;
  readonly location: Location | undefined;
  /**
   * Show blocking loader overlay scoped to this form
   * @param message Optional message to display
   * @param isBlocking Optional blocking mode
   * @returns Loader instance with methods for progressive feedback
   */
  showLoader: (message?: string, isBlocking?: boolean) => { updateMessage(message: string): void; close(): void; block(): void; unblock(): void };
  /**
   * Hide all active loaders
   */
  hideLoaders: () => void;
}
