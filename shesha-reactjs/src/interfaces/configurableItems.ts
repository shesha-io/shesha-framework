export interface ConfigurableItemFullName {
    readonly name: string;
    readonly module?: string | null;
    readonly version?: number;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (formId: ConfigurableItemIdentifier): formId is ConfigurableItemUid => {
  return formId && typeof formId === 'string';
};

export const isConfigurableItemFullName = (formId: ConfigurableItemIdentifier): formId is ConfigurableItemFullName => {
  return formId && Boolean((formId as ConfigurableItemFullName)?.name);
};