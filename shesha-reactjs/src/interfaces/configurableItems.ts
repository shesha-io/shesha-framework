import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

export interface ConfigurableItemFullName {
  readonly name: string;
  readonly module: string | null;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (formId: unknown): formId is ConfigurableItemUid => {
  return typeof formId === 'string' && !isNullOrWhiteSpace(formId);
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

const canonicalModule = (module: unknown): string | null =>
  typeof module === "string" && !isNullOrWhiteSpace(module) ? module : null;

export const normalizeConfigurableItemIdentifier = (value: unknown): ConfigurableItemIdentifier | undefined => {
  if (isConfigurableItemRawId(value)) return value;
  if (isConfigurableItemFullName(value)) return { name: value.name, module: canonicalModule(value.module) };

  if (isDefined(value) && typeof value === "object") {
    if ("name" in value && typeof value.name === "string") {
      const module = "module" in value ? value.module : null;
      const moduleName = isDefined(module) && typeof module === "object" && "name" in module
        ? canonicalModule(module.name)
        : canonicalModule(module);
      return { name: value.name, module: moduleName };
    }
    if ("id" in value && typeof value.id === "string") return value.id;
  }

  return undefined;
};
