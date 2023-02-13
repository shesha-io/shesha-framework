export interface PromisedValue<T> {
    isPending: boolean;
    isResolved: boolean;
    isRejected: boolean;
    value?: T;
    error: any;
    promise: Promise<T>;
}

export function MakePromiseWithState<T>(promise: Promise<T>): PromisedValue<T> {
    const result: PromisedValue<T> = {
        isPending: true,
        isResolved: false,
        isRejected: false,
        promise: null,
        error: null,
    };
    result.promise = promise.then(v => {
            result.isPending = false;
            result.isResolved = true;
            result.value = v;
            return v;
        })
        .catch(e => {
            result.isPending = false;
            result.isRejected = true;
            result.error = e;
            throw e;
        });

    return result;
}