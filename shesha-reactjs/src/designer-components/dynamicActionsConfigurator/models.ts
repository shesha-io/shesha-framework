export interface IDynamicActionsConfiguration<TSettings extends object = object> {
  providerUid?: string | undefined;
  settings?: TSettings | undefined;
}
