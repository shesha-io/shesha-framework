/**
 * Update setting value input
 */
export interface UpdateSettingValueInput {
  /**
   * Setting name
   */
  name: string;
  /**
   * Module name
   */
  module: string;
  /**
   * Setting value
   */
  value: unknown | null;
  /**
   * Front-end application key
   */
  appKey?: string | null | undefined;
}
