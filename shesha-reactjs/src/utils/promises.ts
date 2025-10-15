export interface PromisedValue<T> extends Promise<T> {
  isPending: boolean;
  isResolved: boolean;
  isRejected: boolean;
  value?: T | undefined;
  error: unknown;
  promise: Promise<T>;
}

interface PromiseState<T> {
  isPending: boolean;
  isResolved: boolean;
  isRejected: boolean;
  value?: T | undefined;
  error?: unknown;
}

class StatefulPromise<T> implements PromisedValue<T> {
  private _state: PromiseState<T> = {
    isPending: true,
    isResolved: false,
    isRejected: false,
    value: undefined,
    error: undefined,
  };

  private _promise: Promise<T>;

  get promise(): Promise<T> {
    return this._promise;
  };

  constructor(
    executorOrPromise:
      | ((
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: unknown) => void
      ) => void) |
      Promise<T>,
  ) {
    if (executorOrPromise instanceof Promise) {
      // Wrap an existing promise
      this._promise = executorOrPromise;
      this._attachStateTracking();
    } else {
      // Create new promise with executor
      this._promise = new Promise<T>((resolve, reject) => {
        const resolveWrapper = (value: T | PromiseLike<T>): void => {
          if (this._state.isPending) {
            // Handle thenable objects
            if (value && typeof (value as PromiseLike<T>).then === 'function') {
              (value as PromiseLike<T>).then(
                (innerValue: T) => {
                  this._updateState({
                    isPending: false,
                    isResolved: true,
                    isRejected: false,
                    value: innerValue,
                  });
                  resolve(innerValue);
                },
                (innerError: unknown) => {
                  this._updateState({
                    isPending: false,
                    isResolved: false,
                    isRejected: true,
                    error: innerError,
                  });
                  reject(innerError);
                },
              );
            } else {
              this._updateState({
                isPending: false,
                isResolved: true,
                isRejected: false,
                value: value as T,
              });
              resolve(value as T);
            }
          }
        };

        const rejectWrapper = (reason?: unknown): void => {
          if (this._state.isPending) {
            this._updateState({
              isPending: false,
              isResolved: false,
              isRejected: true,
              error: reason,
            });
            reject(reason);
          }
        };

        try {
          executorOrPromise(resolveWrapper, rejectWrapper);
        } catch (error) {
          rejectWrapper(error);
        }
      });
    }
  }

  private _updateState(newState: Partial<PromiseState<T>>): void {
    this._state = { ...this._state, ...newState };
  }

  private async _attachStateTracking(): Promise<void> {
    try {
      const value = await this._promise;
      this._updateState({
        isPending: false,
        isResolved: true,
        isRejected: false,
        value,
      });
    } catch (error) {
      this._updateState({
        isPending: false,
        isResolved: false,
        isRejected: true,
        error,
      });
    }
  }

  // State properties
  get isPending(): boolean {
    return this._state.isPending;
  }

  get isResolved(): boolean {
    return this._state.isResolved;
  }

  get isRejected(): boolean {
    return this._state.isRejected;
  }

  get value(): T | undefined {
    if (!this._state.isResolved) {
      return undefined;
      // throw new Error('Cannot access value: Promise is not resolved');
    }
    return this._state.value;
  }

  get error(): unknown {
    if (!this._state.isRejected) {
      return undefined;
      // throw new Error('Cannot access error: Promise is not rejected');
    }
    return this._state.error;
  }

  // Promise-like interface
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ): Promise<T | TResult> {
    return this._promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<T> {
    return this._promise.finally(onfinally);
  }

  // Static methods
  static from<T>(promise: Promise<T>): StatefulPromise<T> {
    return new StatefulPromise<T>(promise);
  }

  static resolve<T>(value: T): StatefulPromise<T> {
    return new StatefulPromise<T>((resolve) => {
      resolve(value);
    });
  }

  static reject<T = never>(reason?: unknown): StatefulPromise<T> {
    return new StatefulPromise<T>((_, reject) => {
      reject(reason);
    });
  }

  // Utility methods
  getValue(): T | undefined {
    return this._state.isResolved ? this._state.value : undefined;
  }

  getError(): unknown {
    return this._state.isRejected ? this._state.error : undefined;
  }

  get isSettled(): boolean {
    return !this._state.isPending;
  }

  // Get current state snapshot
  getState(): PromiseState<T> {
    return { ...this._state };
  }

  // Wait for settlement and return state
  async waitForSettlement(): Promise<PromiseState<T>> {
    try {
      const value = await this._promise;
      return {
        isPending: false,
        isResolved: true,
        isRejected: false,
        value,
      };
    } catch (error) {
      return {
        isPending: false,
        isResolved: false,
        isRejected: true,
        error,
      };
    }
  }

  // Convert to native promise
  toPromise(): Promise<T> {
    return this._promise;
  }

  // Symbol.toStringTag
  get [Symbol.toStringTag](): string {
    return 'StatefulPromise';
  }
}

// Factory functions
function createStatefulPromise<T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void
  ) => void,
): StatefulPromise<T> {
  return new StatefulPromise<T>(executor);
}

function wrapPromise<T>(promise: Promise<T>): StatefulPromise<T> {
  return StatefulPromise.from(promise);
}

export {
  StatefulPromise,
  createStatefulPromise,
  wrapPromise,
};

export function MakePromiseWithState<T>(promise: Promise<T>): StatefulPromise<T> {
  const result = wrapPromise(promise);

  return result;
}
