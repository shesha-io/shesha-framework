/**
 * Current logged in User API
 */
export interface UserApi {
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
     * Has role
     */
    hasRoleAsync: (module: string, role: string) => Promise<boolean>;
    /**
     * Has permission
     */
    hasPermissionAsync: (module: string, permission: string) => Promise<boolean>;
}