import { Context, createContext } from "react";


/**
 * Creates a named context with the given default value and display name.
 *
 * @param {T} defaultValue - The default value for the context.
 * @param {string} displayName - The display name for the context.
 * @return {Context<T>} The created context.
 */
export const createNamedContext = <T>(defaultValue: T, displayName: string): Context<T> => {
    const context = createContext<T>(defaultValue);
    context.displayName = displayName;
    return context;
};