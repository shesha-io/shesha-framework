export interface IDynamicActionsConfiguration<TSettings extends object = object> {
  providerUid?: string;
  settings?: TSettings | undefined;
}
