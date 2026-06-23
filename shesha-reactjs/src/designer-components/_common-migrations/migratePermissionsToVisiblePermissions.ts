/* eslint-disable @typescript-eslint/no-deprecated */
import { IConfigurableFormComponent } from "@/providers";

export const migratePermissionsToVisiblePermissions = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(prev: TModel): Omit<TModel, 'permissions'> & { visiblePermissions: string[] | undefined } => {
  const { permissions, ...rest } = prev;
  return { ...rest, visiblePermissions: prev.visiblePermissions ?? permissions };
};
