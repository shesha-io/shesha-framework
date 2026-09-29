export interface Disposable {
  dispose(): void;
}

export interface IAmbientScopeProvider<TContext extends object> {
  beginScope(context: TContext): Disposable;
  getValue<K extends keyof TContext>(key: K): TContext[K] | undefined;
  getCurrentContext(): TContext | undefined;
}

/**
 * A generic ambient scope provider that maintains a stack of full context objects.
 * @typeParam TContext - The complete shape of the ambient context.
 */
export class AmbientScopeProvider<TContext extends object> implements IAmbientScopeProvider<TContext> {
  private readonly scopes: TContext[] = [];

  /**
   * Begins a new ambient scope with a complete context.
   * @param context The full context to push onto the stack.
   * @returns A disposable that pops the scope when disposed.
   */
  beginScope(context: TContext): Disposable {
    this.scopes.push(context);

    return {
      dispose: () => {
        const popped = this.scopes.pop();
        if (popped !== context) {
          console.warn('AmbientScopeProvider: disposed out of order.');
        }
      },
    };
  }

  /**
   * Retrieves the value for a given key from the current (top) scope.
   * @param key The context key.
   * @returns The value, or `undefined` if the stack is empty.
   */
  getValue<K extends keyof TContext>(key: K): TContext[K] | undefined {
    const current = this.scopes[this.scopes.length - 1];
    return current ? current[key] : undefined;
  }

  /**
   * Returns the entire current context, or `undefined` if the stack is empty.
   */
  getCurrentContext(): TContext | undefined {
    return this.scopes[this.scopes.length - 1];
  }
}
