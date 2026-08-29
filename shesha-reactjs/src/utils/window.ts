import { isDefined } from "./nullables";

export const setWindowVar = (name: string, value: unknown): void => {
  if (isDefined(window))
    (window as unknown as Record<string, unknown>)[name] = value;
};
