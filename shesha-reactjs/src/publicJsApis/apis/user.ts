export interface IEntityReferenceDto {
  _className?: string;
  _displayName?: string;
  id?: string;
}

export interface ICurrentUserApi {
  readonly isLoggedIn: boolean;
  readonly id?: string | undefined;
  readonly userName?: string | undefined;
  readonly firstName?: string | undefined;
  readonly lastName?: string | undefined;
  readonly personId?: string | undefined;
  hasPermissionAsync?: ((permissionName: string, permissionedEntityId?: IEntityReferenceDto) => Promise<boolean>) | undefined;
  hasRoleAsync?: ((roleName: string) => Promise<boolean>) | undefined;
  getUserSettingValueAsync?: ((name: string, module: string, defaultValue?: unknown, dataType?: string) => Promise<unknown>) | undefined;
  updateUserSettingValueAsync?: ((name: string, module: string, value: unknown, dataType?: string) => Promise<void>) | undefined;
}
