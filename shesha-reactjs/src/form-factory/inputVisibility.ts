import type { IPropertySetting } from '@/interfaces';
import type { ISettingsInputProps } from '@/designer-components/settingsInput/interfaces';

/**
 * Converts each input's `visibleJs` into the `visible` code evaluator `_addProperty` produces for a
 * component it adds directly.
 *
 * Inputs nested in a `settingsInputRow` are plain objects the builder never walks, so a `visibleJs`
 * left on one reached the markup as an inert string and the input always rendered. `getActualModel`
 * resolves the evaluator when it recurses into the `inputs` array, and `SettingInput` already treats
 * `visible === false` as hidden, so converting here is all that is needed.
 *
 * Split out of `FormBuilderImplementation` so it can be tested without pulling in the component
 * registry the builder depends on.
 */
export const resolveInputVisibility = (inputs: ISettingsInputProps[]): ISettingsInputProps[] =>
  inputs.map((input) => {
    const { visibleJs, ...rest } = input;
    if (typeof visibleJs !== 'string') return input;

    const visible: IPropertySetting<boolean> = { _code: visibleJs, _mode: 'code', _value: false };
    return { ...rest, visible };
  });
