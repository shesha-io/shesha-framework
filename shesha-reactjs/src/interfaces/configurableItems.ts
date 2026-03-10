export interface ConfigurableItemFullName {
  readonly name: string;
  readonly module: string | null;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (formId: ConfigurableItemIdentifier): formId is ConfigurableItemUid => {
  return formId && typeof formId === 'string';
};

export const isConfigurableItemFullName = (value: ConfigurableItemIdentifier): value is ConfigurableItemFullName => {
  return value && Boolean((value as ConfigurableItemFullName)?.name);
};

export const ConfigurableItemIdentifierToString = (value: ConfigurableItemIdentifier): string => {
  return isConfigurableItemFullName(value) ? `${value.module}:${value.name}` : value;
};
