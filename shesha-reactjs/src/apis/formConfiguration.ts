/**
 * Form update markup input
 */
export interface FormUpdateMarkupInput {
  id?: string;
  /**
   * Form markup (components) in JSON format
   */
  markup?: string | null;
  /** Form asscess mode */
  access?: number | undefined;
  /** Form permissions for Required premission mode */
  permissions?: string[] | undefined;
  /** Form model type (if any) */
  modelType?: string | undefined;
}

export interface FormPermissionsDto {
  name?: string | null;
  module?: string | null;
  permissions?: string[] | null;
}
