/**
 * Update setting value input
 */
export interface UpdateSettingValueInput {
  /**
   * Setting name
   */
  name?: string | null;
  /**
   * Module name
   */
  module?: string | null;
  /**
   * Setting value
   */
  value?: unknown;
  /**
   * Front-end application key, see <seealso cref="P:Shesha.Domain.FrontEndApp.AppKey" />. Is used for client-specific applications only
   */
  appKey?: string | null;
}
