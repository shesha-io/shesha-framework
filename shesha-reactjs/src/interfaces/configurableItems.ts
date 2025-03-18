export interface ConfigurableItemFullName {
    readonly name: string;
    readonly module?: string | null;
    readonly version?: number;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (value: ConfigurableItemIdentifier): value is ConfigurableItemUid => {
  return value && typeof value === 'string';
};

export const isConfigurableItemFullName = (value: ConfigurableItemIdentifier): value is ConfigurableItemFullName => {
  return value && Boolean((value as ConfigurableItemFullName)?.name);
};