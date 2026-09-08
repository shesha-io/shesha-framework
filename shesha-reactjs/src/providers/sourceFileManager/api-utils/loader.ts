export const loaderApiDefinition = `
/**
 * 'blocking' renders a full-page overlay that prevents interaction with the app,
 * 'non-blocking' renders a small indicator in the top-right corner.
 */
export type LoaderMode = 'blocking' | 'non-blocking';

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
     * @param mode - 'blocking' (default) or 'non-blocking'
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
    show: (message?: string, mode?: LoaderMode) => LoaderInstance;

    /**
     * Hides all currently displayed loaders immediately
     * @example
     * loader.show('Processing...');
     * await someAsyncOperation();
     * loader.hide();
     */
    hide: () => void;
};`;
