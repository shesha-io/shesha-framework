import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from "@/utils/nullables";

export interface ConfigurableItemFullName {
  readonly name: string;
  readonly module: string | null;
}

export type ConfigurableItemUid = string;
export type ConfigurableItemIdentifier = ConfigurableItemFullName | ConfigurableItemUid;

export const isConfigurableItemRawId = (formId: ConfigurableItemIdentifier): formId is ConfigurableItemUid => {
  return typeof formId === 'string' && !isNullOrWhiteSpace(formId);
};

export const isConfigurableItemFullName = (value: unknown): value is ConfigurableItemFullName => {
  return isDefined(value) && typeof (value) === "object" &&
    "name" in value && typeof (value.name) === "string" &&
    "module" in value && (typeof (value.module) === "string" || value.module === null);
};

export const configurableItemIdentifierToString = (value: ConfigurableItemIdentifier): string => {
  return isConfigurableItemFullName(value)
    ? (isNullOrWhiteSpace(value.module) ? value.name : `${value.module}:${value.name}`)
    : value;
};

/**
 * Identifier shapes stored in persisted form configurations. Unlike {@link ConfigurableItemIdentifier}
 * these are not canonical: the module may be stored as a module object instead of its name, and an item
 * may be stored as a reference carrying only its raw id (see issue #5162).
 * Use {@link normalizeConfigurableItemIdentifier} to convert them into a {@link ConfigurableItemIdentifier}.
 */
export type PersistedConfigurableItemIdentifier =
  | { readonly id: string }
  | {
    readonly name: string;
    /** module name, or the module itself as returned by the configuration items API */
    readonly module?: string | { readonly id?: string; readonly name: string } | null;
  };

const canonicalModule = (module: string | null | undefined): string | null =>
  isNotNullOrWhiteSpace(module) ? module : null;

export const normalizeConfigurableItemIdentifier = (
  value: ConfigurableItemIdentifier | PersistedConfigurableItemIdentifier | undefined,
): ConfigurableItemIdentifier | undefined => {
  if (typeof value === "string") return isNullOrWhiteSpace(value) ? undefined : value;
  if (!isDefined(value)) return undefined;
  if (isConfigurableItemFullName(value)) return { name: value.name, module: canonicalModule(value.module) };

  if ("name" in value && isNotNullOrWhiteSpace(value.name)) {
    const module = "module" in value ? value.module : null;
    return {
      name: value.name,
      module: isDefined(module) && typeof module === "object" ? canonicalModule(module.name) : canonicalModule(module),
    };
  }

  if ("id" in value && isNotNullOrWhiteSpace(value.id)) return value.id;

  return undefined;
};
