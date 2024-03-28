import { SettingsManager } from "./manager";
import { SettingAccessor } from "./settingAccessor";
import { SettingsGroup } from "./settingsGroup";

export interface ICategoryAccessor {

}

/**
 * Settings category API
 */
export class CategoryAccessor extends SettingsGroup<SettingAccessor> implements ICategoryAccessor {
    readonly _moduleAccessor: string;

    constructor(settingManager: SettingsManager, moduleAccessor: string, name: string) {
        super(settingManager, name);
        this._moduleAccessor = moduleAccessor;
    }

    createChild = (accessor: string) => {
        return new SettingAccessor(this._settingManager, this._moduleAccessor, this._accessor, accessor);
    };
}