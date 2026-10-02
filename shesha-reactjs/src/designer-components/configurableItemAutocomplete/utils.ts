import { ConfigurableItemFullName, configurableItemIdentifierToString, IFormValidationRulesOptions, isConfigurableItemFullName } from "@/interfaces";
import { isEntityTypeIdentifier } from "@/providers/metadataDispatcher/entities/utils";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { isDefined, isNullOrWhiteSpace } from "@/utils";
import { ArrayOrSingle } from "@/utils/array";
import { ComponentValidationError } from "@/utils/validation";

const isEntityConfig = (entityType: string | IEntityTypeIdentifier): boolean => {
  return entityType === 'Shesha.Framework.EntityConfig' || entityType === 'Shesha.Domain.EntityConfig' ||
    (isEntityTypeIdentifier(entityType) && entityType.module === 'Shesha' && entityType.name === 'EntityConfig');
};

const isFormConfiguration = (entityType: string | IEntityTypeIdentifier): boolean => {
  return entityType === 'Shesha.Core.FormConfiguration' || entityType === 'Shesha.Domain.FormConfiguration' ||
    (isEntityTypeIdentifier(entityType) && entityType.module === 'Shesha' && entityType.name === 'FormConfiguration');
};

const isReferenceList = (entityType: string | IEntityTypeIdentifier): boolean => {
  return entityType === 'Shesha.Framework.ReferenceList' || entityType === 'Shesha.Domain.ReferenceList' ||
    (isEntityTypeIdentifier(entityType) && entityType.module === 'Shesha' && entityType.name === 'ReferenceList');
};

export const validateConfigurationItemReference = async (entityType: string, value: ArrayOrSingle<ConfigurableItemFullName | string>, context: IFormValidationRulesOptions): Promise<void> => {
  if (isNullOrWhiteSpace(entityType))
    return;

  const allErrors: Error[] = [];
  if (isEntityConfig(entityType)) {
    allErrors.push(...await validateEntityReference(value, context));
  }
  if (isReferenceList(entityType)) {
    allErrors.push(...await validateReferenceListReference(value, context));
  }
  if (isFormConfiguration(entityType)) {
    allErrors.push(...await validateFormReference(value, context));
  }

  if (allErrors.length > 0)
    throw allErrors;
};

export const validateEntityReference = async (value: ArrayOrSingle<ConfigurableItemFullName | string>, context: IFormValidationRulesOptions): Promise<Error[]> => {
  const allErrors: Error[] = [];

  const values = Array.isArray(value) ? value : [value];

  const metadataDispatcher = isDefined(context.appContext) ? context.appContext.metadataDispatcher : undefined;
  if (isDefined(metadataDispatcher)) {
    for (const item of values) {
      const isEntity = await metadataDispatcher.isEntityType(item);
      context.dependencies.addEntityReference(item, isEntity);
      if (!isEntity)
        allErrors.push(new ComponentValidationError(`Unknown entity type '${configurableItemIdentifierToString(item)}'`, context.path, ''));
    }
  } else
    console.warn("Can't validate entity reference. MetadataDispatcher is not defined");

  return allErrors;
};

export const validateReferenceListReference = async (value: ArrayOrSingle<ConfigurableItemFullName | string>, context: IFormValidationRulesOptions): Promise<Error[]> => {
  const allErrors: Error[] = [];

  const values = Array.isArray(value) ? value : [value];
  const { configurationLoader: loader } = context.validator;
  for (const item of values) {
    if (!isConfigurableItemFullName(item))
      continue;

    try {
      await loader.getRefListAsync({
        refListId: item,
        skipCache: false,
      });
      context.dependencies.addReferenceList(item, true);
    } catch {
      allErrors.push(new ComponentValidationError(`Reference List '${configurableItemIdentifierToString(item)}' not found`, context.path, ''));
      context.dependencies.addReferenceList(item, false);
    }
  }

  return allErrors;
};

export const validateFormReference = async (value: ArrayOrSingle<ConfigurableItemFullName | string>, context: IFormValidationRulesOptions): Promise<Error[]> => {
  const allErrors: Error[] = [];

  const values = Array.isArray(value) ? value : [value];
  const { configurationLoader: loader } = context.validator;
  for (const item of values) {
    if (!isConfigurableItemFullName(item))
      continue;

    try {
      await loader.getFormAsync({
        formId: item,
        skipCache: false,
      });
      context.dependencies.addForm(item, true);
    } catch {
      allErrors.push(new ComponentValidationError(`Form '${configurableItemIdentifierToString(item)}' not found`, context.path, ''));
      context.dependencies.addForm(item, false);
    }
  }

  return allErrors;
};

