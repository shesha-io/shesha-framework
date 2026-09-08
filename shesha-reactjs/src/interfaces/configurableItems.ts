import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

export interface ConfigurableItemFullName {
  readonly name: string;
  readonly module: string | null;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (id: ConfigurableItemIdentifier | undefined): id is ConfigurableItemUid => {
  return typeof id === 'string' && !isNullOrWhiteSpace(id);
};

export const isConfigurableItemFullName = (value: unknown): value is ConfigurableItemFullName => {
  return isDefined(value) && typeof (value) === "object" &&
    "name" in value && typeof (value.name) === "string" &&
    "module" in value && (typeof (value.module) === "string" || value.module === null);
};

export const isValidConfigurableItemRawId = (id: ConfigurableItemIdentifier | undefined): id is ConfigurableItemUid => {
  return isConfigurableItemRawId(id) && !isNullOrWhiteSpace(id);
};

export const isValidConfigurableItemFullName = (id: ConfigurableItemIdentifier | undefined): id is ConfigurableItemFullName => {
  return isConfigurableItemFullName(id) && !isNullOrWhiteSpace(id.module) && !isNullOrWhiteSpace(id.name);
};

export const isValidConfigurableItemIdentifier = (id: ConfigurableItemIdentifier | undefined): id is ConfigurableItemIdentifier => {
  return isValidConfigurableItemFullName(id) || isValidConfigurableItemRawId(id);
};

export const configurableItemIdentifierToString = (value: ConfigurableItemIdentifier): string => {
  return isConfigurableItemFullName(value)
    ? (isNullOrWhiteSpace(value.module) ? value.name : `${value.module}:${value.name}`)
    : value;
};
