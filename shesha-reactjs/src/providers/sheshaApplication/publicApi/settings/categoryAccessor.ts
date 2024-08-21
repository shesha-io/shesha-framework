import { SettingsManager } from "./manager";
import { SettingAccessor } from "./settingAccessor";
import { BaseAccessor } from "../common/baseAccessor";

export interface ISettingsCategoryAccessor {

}

/**
 * Settings category API
 */
export class SettingsCategoryAccessor extends BaseAccessor<SettingAccessor, SettingsManager> implements ISettingsCategoryAccessor {
    readonly _moduleAccessor: string;

    constructor(settingManager: SettingsManager, moduleAccessor: string, name: string) {
        super(settingManager, name);
        this._moduleAccessor = moduleAccessor;
    }

    createChild = (accessor: string) => {
        return new SettingAccessor(this._manager, this._moduleAccessor, this._accessor, accessor);
    };
}