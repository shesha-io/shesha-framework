import { SettingsCategoryAccessor } from "./categoryAccessor";
import { BaseAccessor } from "../common/baseAccessor";
import { SettingsManager } from "./manager";

export interface ISettingsModuleAccessor {

}

/**
 * Settings: module accessor
 */
export class SettingsModuleAccessor extends BaseAccessor<SettingsCategoryAccessor, SettingsManager> implements ISettingsModuleAccessor {
    createChild = (accessor: string) => {
        return new SettingsCategoryAccessor(this._manager, this._accessor, accessor);
    };
}