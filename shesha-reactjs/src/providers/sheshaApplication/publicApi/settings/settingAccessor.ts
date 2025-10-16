import { SettingsManager } from "./manager";

/**
 * Setting value accessor. It allows to read and write specified setting value.
 */
export interface ISettingAccessor<Value = any> {
  getValueAsync: () => Promise<Value>;
  setValueAsync: (value: Value) => Promise<void>;
}
/**
 * Setting value accessor. It allows to read and write specified setting value.
 */
export class SettingAccessor<Value = any> implements ISettingAccessor<Value> {
  readonly _name: string;

  readonly _moduleAccessor: string;

  readonly _categoryAccessor: string;

  readonly _settingManager: SettingsManager;

  constructor(settingManager: SettingsManager, moduleAccessor: string, categoryAccessor: string, name: string) {
    this._settingManager = settingManager;
    this._moduleAccessor = moduleAccessor;
    this._categoryAccessor = categoryAccessor;
    this._name = name;
  }

  /**
   * Reads setting value
   *
   * @returns setting value
   */
  getValueAsync(): Promise<Value> {
    return this._settingManager.getValueAsync<Value>({ module: this._moduleAccessor, category: this._categoryAccessor, name: this._name });
  };

  /**
   * Writes setting value
   * @param value New value
   * @returns Promise that will be resolved when value is written
   */
  setValueAsync(value: Value): Promise<void> {
    return this._settingManager.setValueAsync<Value>({ module: this._moduleAccessor, category: this._categoryAccessor, name: this._name }, value);
  }
}
