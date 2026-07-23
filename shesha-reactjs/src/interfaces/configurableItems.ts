import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

export interface ConfigurableItemFullName {
  readonly name: string;
  readonly module: string | null;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (formId: unknown): formId is ConfigurableItemUid => {
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

export const normalizeConfigurableItemIdentifier = (value: unknown): ConfigurableItemIdentifier | undefined => {
  if (isConfigurableItemRawId(value)) return value;
  if (isConfigurableItemFullName(value)) return { name: value.name, module: value.module ?? null };

  if (isDefined(value) && typeof value === "object") {
    if ("name" in value && typeof value.name === "string") {
      const module = "module" in value ? value.module : null;
      const moduleName = typeof module === "string"
        ? module
        : isDefined(module) && typeof module === "object" && "name" in module && typeof module.name === "string"
          ? module.name
          : null;
      return { name: value.name, module: moduleName };
    }
    if ("id" in value && typeof value.id === "string") return value.id;
  }

  return undefined;
};
