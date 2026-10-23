export interface PermissionedObjectDto {
  id?: string;
  object?: string | null;
  category?: string | null;
  moduleName?: string | null;
  module?: string | null;
  type?: string | null;
  name?: string | null;
  description?: string | null;
  permissions?: string[] | null;
  actualPermissions?: string[] | null;
  inherited?: boolean;
  access?: number | null;
  actualAccess?: number | null;
  parent?: string | null;
  dependency?: string | null;
  children?: PermissionedObjectDto[] | null;
  hidden?: boolean;
  hardcoded?: boolean | null;
}
