export interface IValuable<TValue = unknown> {
  defaultValue?: TValue | undefined;
  value?: TValue | undefined;
}
