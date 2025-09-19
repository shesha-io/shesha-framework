import { IConfigurableFormComponent } from '@/interfaces';

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
 * Recursively extracts data field references from a form component and its children
 * @param component The form component to analyze
 * @returns Array of unique field names found in the component tree
 */
export const extractFieldsFromComponent = (component: IConfigurableFormComponent): string[] => {
  if (!component) return [];

  const fields: string[] = [];

  // Extract fields from various component properties that might contain data bindings
  const contentProperties = [
    'content',        // Text components
    'text',          // Alert, button text
    'label',         // Component labels
    'placeholder',   // Input placeholders
    'tooltip',       // Tooltip text
    'description',   // Component descriptions
    'defaultValue',  // Default values that might reference data
    'value',         // Static values that might reference data
    'customEnabled', // Custom enabled expressions
    'customVisibility', // Custom visibility expressions
    'onBlurCustom',  // Custom event handlers
    'onChangeCustom',
    'onFocusCustom',
    'customCss',     // Custom CSS that might reference data
    'style'          // Style objects that might contain expressions
  ];

  // Check each property for data bindings
  contentProperties.forEach(prop => {
    const value = (component as any)[prop];
    if (typeof value === 'string') {
      fields.push(...extractFieldsFromContent(value));
    } else if (typeof value === 'object' && value !== null) {
      // Handle object properties (like style objects)
      const objStr = JSON.stringify(value);
      fields.push(...extractFieldsFromContent(objStr));
    }
  });

  // If component has a propertyName, include it (for input/output components)
  if (component.propertyName && typeof component.propertyName === 'string') {
    fields.push(component.propertyName);
  }

  // Recursively process child components
  if (component.components && Array.isArray(component.components)) {
    component.components.forEach(child => {
      fields.push(...extractFieldsFromComponent(child));
    });
  }

  return fields;
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

  // Remove duplicates and filter out empty strings
  const uniqueFields = [...new Set(allFields)]
    .filter(field => field && field.trim().length > 0)
    .sort();

  return uniqueFields;
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

  // Remove duplicates and return sorted array
  return [...new Set(fields)]
    .filter(field => field && field.trim().length > 0)
    .sort();
};