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
  id: string;
  /**
   * User Name
   */
  userName: string;
  /**
   * First Name
   */
  firstName: string;
  /**
   * Last Name
   */
  lastName: string;
  /**
   * Person Id
   */
  personId: string;
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
  getUserSettingValueAsync(name: string, module: string, defaultValue?: any, dataType?: string): Promise<any>;
  /**
   * Update User Setting
   */
  updateUserSettingValueAsync(name: string, module: string, value: any, dataType?: string): Promise<void>;
}
