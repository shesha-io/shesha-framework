import { IValue } from "./interfaces";

export const getStyleValue = (type: keyof IValue, value: number) => {
    const v = value || '{}' as IValue;
    return (v || {})[`${type}}`] || 0;
};