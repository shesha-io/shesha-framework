export const migratePermissionsToVisiblePermissions = <TModel extends { permissions?: string[] | undefined; visiblePermissions?: string[] | undefined }>(prev: TModel): Omit<TModel, 'permissions'> & { visiblePermissions: string[] | undefined } => {
  const { permissions, ...rest } = prev;
  return { ...rest, visiblePermissions: prev.visiblePermissions ?? permissions };
};
