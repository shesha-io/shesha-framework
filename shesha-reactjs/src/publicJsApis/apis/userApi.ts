export interface IEntityReferenceDto {
  _className?: string;
  id?: string;
}

/**
 * Current logged in User API
 */
export interface UserApi {
  /**
   * Is user logged in
   */
  isLoggedIn: boolean;
  /**
   * Internal Id
   */
  id: string | undefined;
  /**
   * User Name
   */
  userName: string | undefined;
  /**
   * First Name
   */
  firstName: string | undefined;
  /**
   * Last Name
   */
  lastName: string | undefined;
  /**
   * Person Id
   */
  personId: string | undefined;
  /**
   * Has role
   */
  hasRoleAsync: (role: string) => Promise<boolean>;
  /**
   * Has permission
   */
  hasPermissionAsync: (permission: string, permissionedEntity?: IEntityReferenceDto) => Promise<boolean>;
  /**
   * Get User Setting
   */
  getUserSettingValueAsync<TValue = unknown>(name: string, module: string, defaultValue?: TValue, dataType?: string): Promise<TValue>;
  /**
   * Update User Setting
   */
  updateUserSettingValueAsync<TValue = unknown>(name: string, module: string, value: TValue, dataType?: string): Promise<void>;
}
