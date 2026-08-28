import { RefListDisplayMode } from '@/components/refListDisplaySelector/models';
import { IPropertySetting } from '@/providers/form/models';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';

/**
 * Either of the two switches this replaces could be a plain boolean or a JS setting, both of them
 * having been declared with `jsSetting: true`.
 */
type SwitchValue = boolean | IPropertySetting<boolean> | undefined;

const isSetting = (value: SwitchValue): value is IPropertySetting<boolean> =>
  isDefined(value) && typeof value === 'object' && '_mode' in value;

/** The value a setting falls back to, which for a JS setting is the one stored alongside the code. */
const staticValue = (value: SwitchValue, fallback: boolean): boolean => {
  if (isSetting(value))
    return value._value ?? fallback;
  return isDefined(value) ? value : fallback;
};

/**
 * The old pair had no mode for "neither", which rendered as a bare colour badge. Those land on
 * `both`, so nothing comes out blank after the upgrade - at the cost of changing how a deliberately
 * colour-only badge looks.
 */
const toMode = (showName: boolean, showIcon: boolean): RefListDisplayMode => {
  if (showName && showIcon) return 'both';
  if (showIcon) return 'icon';
  if (showName) return 'name';
  return 'both';
};

/**
 * A JS switch is an expression body, so it composes into the new one by being called in place. That
 * keeps a configurator's expressions working rather than silently discarding them for the static
 * fallback the setting happens to carry.
 */
const expression = (value: SwitchValue, fallback: boolean): string =>
  isSetting(value) && value._mode === 'code' && isNotNullOrWhiteSpace(value._code)
    ? `(() => { ${value._code} })()`
    : String(staticValue(value, fallback));

/* `showName` defaulted to true and `showIcon` to false before the selector existed; the composed
   expression has to keep both defaults for a migrated form to look the way it did. */
const composedCode = (name: SwitchValue, icon: SwitchValue): string => [
  '// Migrated from the separate Show Reference List Item Name and Show Icon settings.',
  `const showName = ${expression(name, true)};`,
  `const showIcon = ${expression(icon, false)};`,
  'return { showName: showName === undefined ? true : Boolean(showName), showIcon: Boolean(showIcon) };',
].join('\n');

export interface IMigratedItemDisplay {
  itemDisplay: RefListDisplayMode | IPropertySetting<RefListDisplayMode>;
}

/**
 * Folds `showReflistName` and `showIcon` into the single `itemDisplay` setting the display selector
 * reads. Where either switch was driven by JS the result is a JS setting too, since the selector's
 * three modes cannot express a value computed per row.
 */
export const migrateItemDisplay = (showReflistName: SwitchValue, showIcon: SwitchValue): IMigratedItemDisplay => {
  const mode = toMode(staticValue(showReflistName, true), staticValue(showIcon, false));

  const isDynamic = (isSetting(showReflistName) && showReflistName._mode === 'code') ||
    (isSetting(showIcon) && showIcon._mode === 'code');

  return {
    itemDisplay: isDynamic
      ? { _mode: 'code', _code: composedCode(showReflistName, showIcon), _value: mode }
      : mode,
  };
};
