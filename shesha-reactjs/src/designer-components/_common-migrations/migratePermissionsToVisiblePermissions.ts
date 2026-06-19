/* eslint-disable @typescript-eslint/no-deprecated */
import { IConfigurableFormComponent } from "@/providers";

export const migratePermissionsToVisiblePermissions = <TModel extends IConfigurableFormComponent = IConfigurableFormComponent>(prev: TModel): TModel => {
  const model = { ...prev };
  model.visiblePermissions = model.permissions;
  delete model.permissions;
  return model;
};
