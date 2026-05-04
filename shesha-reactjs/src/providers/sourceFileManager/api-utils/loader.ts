export const loaderApiDefinition = `
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

export type LoaderApi = {
    /**
     * Shows a full-page loader with a spinner overlay
     * @param message - The message to display below the spinner (default: 'Loading...')
     * @param isBlocking - Whether the loader should prevent user interaction (default: true)
     * @returns A loader instance with methods for progressive feedback
     * @example
     * const loader = loader.show('Hang tight whilst we update...');
     * try {
     *   await http.post('/api/save', data);
     *   loader.close();
     *   message.success('Saved successfully!');
     * } catch (error) {
     *   loader.close();
     *   message.error('Failed to save');
     * }
     */
    show: (message?: string, isBlocking?: boolean) => LoaderInstance;

    /**
     * Hides all currently displayed loaders immediately
     * @example
     * loader.show('Processing...');
     * await someAsyncOperation();
     * loader.hide();
     */
    hide: () => void;
};`;
