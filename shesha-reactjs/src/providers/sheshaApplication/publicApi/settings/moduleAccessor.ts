import { SettingsCategoryAccessor } from "./categoryAccessor";
import { BaseAccessor } from "../common/baseAccessor";
import { SettingsManager } from "./manager";

/**
 * Settings: module accessor
 */
export class SettingsModuleAccessor extends BaseAccessor<SettingsCategoryAccessor, SettingsManager> {
  override createChild = (accessor: string): SettingsCategoryAccessor => {
    return new SettingsCategoryAccessor(this._manager, this._accessor, accessor);
  };
}
