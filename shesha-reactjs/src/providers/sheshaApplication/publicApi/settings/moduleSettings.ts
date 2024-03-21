import { CategoryAccessor } from "./categoryAccessor";
import { SettingsGroup } from "./settingsGroup";

export interface IModuleSettings {

}

/**
 * Module settings API
 */
export class ModuleSettings extends SettingsGroup<CategoryAccessor> implements IModuleSettings {
    createChild = (accessor: string) => {
        return new CategoryAccessor(this._settingManager, this._accessor, accessor);
    };
}