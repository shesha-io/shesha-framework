export const pageContextApiDefinition = `
/**
 * Loader instance with methods for progressive feedback and control
 * @example
 * const loader = pageContext.showLoader("Fetching items...");
 * const items = await getItems();
 *
 * loader.updateMessage("Processing...");
 *
 * myCollection.forEach((item, index) => {
 *   loader.updateMessage(\`Processing item \${index}...\`);
 * });
 *
 * loader.close();
 */
export interface LoaderInstance {
    /**
     * Updates the message displayed in the loader
     * @param message - The new message to display
     */
    updateMessage(message: string): void;

    /**
     * Switches the loader to blocking mode (prevents user interaction)
     */
    block(): void;

    /**
     * Switches the loader to non-blocking mode (allows user interaction)
     */
    unblock(): void;

    /**
     * Closes and removes this specific loader instance
     */
    close(): void;
}

/**
 * Page context is the main context for the current page
 * It provides access to page-level data and API methods
 */
export interface IPageContext {
    /**
     * Shows a full-page loader with a spinner overlay
     * @param message - The message to display below the spinner (default: 'Loading...')
     * @param isBlocking - Whether the loader should prevent user interaction (default: true)
     * @returns A loader instance with methods for progressive feedback
     * @example
     * const loader = pageContext.showLoader('Processing data...');
     * try {
     *   await processData();
     *   loader.updateMessage('Almost done...');
     *   await finalizeData();
     *   loader.close();
     * } catch (error) {
     *   loader.close();
     *   message.error('Failed to process data');
     * }
     */
    showLoader: (message?: string, isBlocking?: boolean) => LoaderInstance;

    /**
     * Hides all currently displayed loaders immediately
     * @example
     * pageContext.hideLoaders();
     */
    hideLoaders: () => void;

    /**
     * Set a field value in the page context
     * @param name - Field name in dot notation (e.g., 'user.name')
     * @param value - The value to set
     */
    setFieldValue?: (name: string, value: any) => void;

    // Allow additional properties from the data model
    [key: string]: any;
}
`;
