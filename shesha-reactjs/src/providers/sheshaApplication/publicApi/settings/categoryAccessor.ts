import { SettingsManager } from "./manager";
import { SettingAccessor } from "./settingAccessor";
import { BaseAccessor } from "../common/baseAccessor";

/**
 * Settings category API
 */
export class SettingsCategoryAccessor extends BaseAccessor<SettingAccessor, SettingsManager> {
  readonly _moduleAccessor: string;

  constructor(settingManager: SettingsManager, moduleAccessor: string, name: string) {
    super(settingManager, name);
    this._moduleAccessor = moduleAccessor;
  }

  override createChild = (accessor: string): SettingAccessor => {
    return new SettingAccessor(this._manager, this._moduleAccessor, this._accessor, accessor);
  };
}
