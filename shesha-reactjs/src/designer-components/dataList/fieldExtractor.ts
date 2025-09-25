import { IConfigurableFormComponent } from '@/interfaces';
import { IModelMetadata, metadataHasNestedProperties, isPropertiesArray } from '@/interfaces/metadata';

/**
 * Extracts data field references from a string content that contains expressions like {{data.fieldName}}
 * @param content The content string to parse for data bindings
 * @returns Array of unique field names found in the content
 */
export const extractFieldsFromContent = (content: string): string[] => {
  if (!content || typeof content !== 'string') return [];

  // Regular expression to match {{data.fieldName}} patterns
  // Supports nested properties like {{data.person.firstName}}
  const dataBindingRegex = /\{\{\s*data\.([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*\}\}/g;

  const fields: string[] = [];
  let match;

  while ((match = dataBindingRegex.exec(content)) !== null) {
    const fieldPath = match[1]; // The captured group containing the field path

    // For nested properties, we might want just the top-level field or the full path
    // For now, let's extract the full path and the top-level field
    fields.push(fieldPath);

    // Also add top-level field for nested properties (e.g., 'person' from 'person.firstName')
    const topLevelField = fieldPath.split('.')[0];
    if (topLevelField !== fieldPath) {
      fields.push(topLevelField);
    }
  }

  return fields;
};

/**
 * Checks if a value is a property setting with bindings
 */
const isPropertySetting = (value: any): boolean => {
  return value && typeof value === 'object' && value._mode !== undefined;
};

/**
 * Recursively discovers all property bindings in an object
 * @param obj The object to analyze for property bindings
 * @param fields Array to collect discovered field references
 */
const discoverPropertyBindings = (obj: any, fields: string[]): void => {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];

    if (isPropertySetting(value)) {
      // This is a property setting - extract fields from its code/value
      if (value._mode === 'code' && typeof value._code === 'string') {
        fields.push(...extractFieldsFromContent(value._code));
      } else if (value._mode === 'value' && typeof value._value === 'string') {
        fields.push(...extractFieldsFromContent(value._value));
      }
    } else if (typeof value === 'string') {
      // Regular string property - check for data bindings
      fields.push(...extractFieldsFromContent(value));
    } else if (Array.isArray(value)) {
      // Array - check each item
      value.forEach(item => discoverPropertyBindings(item, fields));
    } else if (typeof value === 'object') {
      // Nested object - recurse
      discoverPropertyBindings(value, fields);
    }
  }
};

/**
 * Recursively extracts originalModel.propertyName values from form components (for data binding)
 * This focuses specifically on components that have originalModel.propertyName configured
 * @param component The form component to analyze
 * @returns Array of unique originalModel.propertyName values found in the component tree
 */
export const extractPropertyNamesFromComponent = (component: IConfigurableFormComponent): string[] => {
  if (!component) return [];

  const propertyNames: string[] = [];

  // Check for originalModel.propertyName (the actual property binding)
  if ((component as any)?.originalModel?.propertyName && typeof (component as any).originalModel.propertyName === 'string') {
    propertyNames.push((component as any).originalModel.propertyName);
  }

  // Fallback: Also check for propertyName if originalModel.propertyName is not available
  if (component.propertyName && typeof component.propertyName === 'string') {
    propertyNames.push(component.propertyName);
  }

  // Recursively process child components - check if component has children property
  const childComponents = (component as any).components || (component as any).children;
  if (childComponents && Array.isArray(childComponents)) {
    childComponents.forEach((child: IConfigurableFormComponent) => {
      propertyNames.push(...extractPropertyNamesFromComponent(child));
    });
  }

  return propertyNames;
};

/**
 * Recursively extracts data field references from a form component and its children
 * This function discovers ALL property bindings in the component, not just predefined ones
 * @param component The form component to analyze
 * @returns Array of unique field names found in the component tree
 */
export const extractFieldsFromComponent = (component: IConfigurableFormComponent): string[] => {
  if (!component) return [];

  const fields: string[] = [];

  // Discover ALL property bindings in the component (not just predefined properties)
  discoverPropertyBindings(component, fields);

  // If component has a propertyName, include it (for input/output components)
  if (component.propertyName && typeof component.propertyName === 'string') {
    fields.push(component.propertyName);
  }

  // Recursively process child components - check if component has children property
  const childComponents = (component as any).components || (component as any).children;
  if (childComponents && Array.isArray(childComponents)) {
    childComponents.forEach((child: IConfigurableFormComponent) => {
      fields.push(...extractFieldsFromComponent(child));
    });
  }

  return fields;
};

/**
 * Extracts originalModel.propertyName values from form markup structure (for data fetching)
 * This focuses on actual originalModel.propertyName attributes of form components
 * @param markup Array of form components that make up the form structure
 * @returns Array of unique originalModel.propertyName values required for data fetching
 */
export const extractPropertyNamesFromFormMarkup = (markup: IConfigurableFormComponent[]): string[] => {
  if (!markup || !Array.isArray(markup)) return [];

  const allPropertyNames: string[] = [];

  // Process each top-level component
  markup.forEach(component => {
    allPropertyNames.push(...extractPropertyNamesFromComponent(component));
  });

  // Remove duplicates and filter out empty strings and 'versionNo'
  const uniquePropertyNames = [...new Set(allPropertyNames)]
    .filter(propertyName => propertyName && propertyName.trim().length > 0)
    .sort();

  return uniquePropertyNames;
};

/**
 * Extracts all data field references from a form markup structure
 * @param markup Array of form components that make up the form structure
 * @returns Array of unique field names required by the form
 */
export const extractFieldsFromFormMarkup = (markup: IConfigurableFormComponent[]): string[] => {
  if (!markup || !Array.isArray(markup)) return [];

  const allFields: string[] = [];

  // Process each top-level component
  markup.forEach(component => {
    allFields.push(...extractFieldsFromComponent(component));
  });

  // Remove duplicates and filter out empty strings and 'versionNo'
  const uniqueFields = [...new Set(allFields)]
    .filter(field => field && field.trim().length > 0 && field !== 'versionNo')
    .sort();

  return uniqueFields;
};

/**
 * Validates property names against model metadata to ensure they exist as columns
 * @param propertyNames Array of property names to validate
 * @param modelMetadata The model metadata to validate against
 * @returns Object with valid and invalid property names
 */
export const validatePropertyNamesAgainstModel = (
  propertyNames: string[],
  modelMetadata: IModelMetadata | null
): { validProperties: string[], invalidProperties: string[] } => {
  if (!modelMetadata || !propertyNames.length) {
    return { validProperties: propertyNames, invalidProperties: [] };
  }

  const validProperties: string[] = [];
  const invalidProperties: string[] = [];

  // Check if metadata has nested properties and get them as array
  if (!metadataHasNestedProperties(modelMetadata)) {
    // If no properties available, consider all as invalid
    return { validProperties: [], invalidProperties: propertyNames };
  }

  const properties = isPropertiesArray(modelMetadata.properties)
    ? modelMetadata.properties
    : [];

  if (properties.length === 0) {
    // If no properties available, consider all as invalid
    return { validProperties: [], invalidProperties: propertyNames };
  }

  propertyNames.forEach(propertyName => {
    // For nested properties (e.g., "person.firstName"), validate the base property ("person")
    const baseProperty = propertyName.split('.')[0];

    // Check if the base property exists in the model
    const propertyExists = properties.some(prop =>
      prop.path === baseProperty || prop.path === propertyName
    );

    if (propertyExists) {
      validProperties.push(propertyName);
    } else {
      invalidProperties.push(propertyName);
    }
  });

  return { validProperties, invalidProperties };
};

/**
 * Extracts originalModel.propertyName values from a complete form configuration object
 * This is specifically for determining which fields to fetch from the backend
 * @param formConfig The form configuration object containing markup and settings
 * @returns Array of unique originalModel.propertyName values required for data fetching
 */
export const extractPropertyNamesFromFormConfig = (formConfig: any): string[] => {
  if (!formConfig) return [];

  const propertyNames: string[] = [];

  // Extract propertyName values from markup
  if (formConfig.markup) {
    propertyNames.push(...extractPropertyNamesFromFormMarkup(formConfig.markup));
  }

  // Remove duplicates and return sorted array, filter out 'versionNo'
  return [...new Set(propertyNames)]
    .filter(propertyName => propertyName && propertyName.trim().length > 0 && propertyName !== 'versionNo')
    .sort();
};

/**
 * Extracts and validates originalModel.propertyName values from a complete form configuration object
 * Filters out properties that don't exist in the model metadata
 * @param formConfig The form configuration object containing markup and settings
 * @param modelMetadata The model metadata to validate against (optional)
 * @returns Object with valid property names and validation info
 */
export const extractValidatedPropertyNamesFromFormConfig = (
  formConfig: any,
  modelMetadata?: IModelMetadata | null
): {
  validProperties: string[],
  invalidProperties: string[],
  allExtracted: string[]
} => {
  const allExtracted = extractPropertyNamesFromFormConfig(formConfig);

  if (!modelMetadata) {
    return {
      validProperties: allExtracted,
      invalidProperties: [],
      allExtracted
    };
  }

  const validation = validatePropertyNamesAgainstModel(allExtracted, modelMetadata);

  return {
    validProperties: validation.validProperties,
    invalidProperties: validation.invalidProperties,
    allExtracted
  };
};

/**
 * Extracts fields from a complete form configuration object
 * @param formConfig The form configuration object containing markup and settings
 * @returns Array of unique field names required by the form
 */
export const extractFieldsFromFormConfig = (formConfig: any): string[] => {
  if (!formConfig) return [];

  const fields: string[] = [];

  // Extract from markup
  if (formConfig.markup) {
    fields.push(...extractFieldsFromFormMarkup(formConfig.markup));
  }

  // Extract from settings if they contain data bindings
  if (formConfig.settings) {
    const settingsStr = JSON.stringify(formConfig.settings);
    fields.push(...extractFieldsFromContent(settingsStr));
  }

  // Remove duplicates and return sorted array, filter out 'versionNo'
  return [...new Set(fields)]
    .filter(field => field && field.trim().length > 0 && field !== 'versionNo')
    .sort();
};