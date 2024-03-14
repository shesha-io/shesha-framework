export const fakeLoader = <Value = any>(value: Value, delay: number, message: string): Promise<Value> => {
    console.log(`${message} - started`);

    return new Promise<Value>((resolve) => {
        setTimeout(() => {
            console.log(`${message} - finished`);
            resolve(value);
        }, delay);
    });
};