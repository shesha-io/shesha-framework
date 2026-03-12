export const loaderApiDefinition = `
export interface LoaderInstance {
    /**
     * Hides the currently displayed loader
     */
    (): void;
}

export type LoaderApi = {
    /**
     * Shows a full-page blocking loader with a spinner overlay
     * Prevents user interaction until the loader is hidden
     * @param message - The message to display below the spinner (default: 'Loading...')
     * @returns A function to hide this specific loader instance
     * @example
     * const hideLoader = loader.show('Hang tight whilst we update...');
     * try {
     *   await http.post('/api/save', data);
     *   hideLoader();
     *   message.success('Saved successfully!');
     * } catch (error) {
     *   hideLoader();
     *   message.error('Failed to save');
     * }
     */
    show: (message?: string) => LoaderInstance;

    /**
     * Hides all currently displayed loaders immediately
     * @example
     * loader.show('Processing...');
     * await someAsyncOperation();
     * loader.hide();
     */
    hide: () => void;
};`;
