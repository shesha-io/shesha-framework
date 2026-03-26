import { isDefined } from "@/utils/nullables";

export interface ConfigurableItemFullName {
  readonly name: string;
  readonly module: string | null;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (formId: ConfigurableItemIdentifier): formId is ConfigurableItemUid => {
  return isDefined(formId) && typeof formId === 'string';
};

export const isConfigurableItemFullName = (value: unknown): value is ConfigurableItemFullName => {
  return isDefined(value) && typeof (value) === "object" &&
    "name" in value && typeof (value.name) === "string" &&
    "module" in value && typeof (value.module) === "string";
};

export const ConfigurableItemIdentifierToString = (value: ConfigurableItemIdentifier): string => {
  return isConfigurableItemFullName(value) ? `${value.module}:${value.name}` : value;
};
