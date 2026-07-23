import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

export interface ConfigurableItemFullName {
  readonly name: string;
  readonly module?: string | null | undefined;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (formId: ConfigurableItemIdentifier): formId is ConfigurableItemUid => {
  return isDefined(formId) && typeof formId === 'string';
};

export const isConfigurableItemFullName = (value: unknown): value is ConfigurableItemFullName => {
  return isDefined(value) && typeof (value) === "object" &&
    "name" in value && typeof (value.name) === "string" &&
    (!("module" in value) || typeof (value.module) === "string" || value.module === null || value.module === undefined);
};

export const configurableItemIdentifierToString = (value: ConfigurableItemIdentifier): string => {
  return isConfigurableItemFullName(value)
    ? (isNullOrWhiteSpace(value.module) ? value.name : `${value.module}:${value.name}`)
    : value;
};
