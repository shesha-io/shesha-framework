import { IStyleValue } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';

/**
 * The Appearance style properties that make up the nested set.
 *
 * `font` and `shadow` are absent because the nested panel does not expose them — the option's
 * label font comes from the wrapper's font panel.
 */
const NESTED_STYLE_PROPERTIES = ['dimensions', 'border', 'background', 'stylingBoxJson', 'style'] as const;

/**
 * A style model for an option component (radio, checkbox group): the bare-named properties style
 * the component wrapper, and a nested set under `TNested` styles each repeated option.
 */
export type INestedStyleValue<TNested extends string> = IStyleValue & { [K in TNested]?: IStyleValue | undefined };

/**
 * Moves an existing single style set onto a nested sub-property.
 *
 * Option components (radio, checkbox group) used to expose one set of Appearance panels whose
 * values styled the *repeated option*. They now expose two sets: the bare-named properties style
 * the component wrapper, and the nested set (`radio.*` / `checkbox.*`) styles each option. Without
 * this migration every saved form's styling would silently move to the wrapper.
 *
 * Only the per-device buckets are rewritten, because that is where the style router binds
 * (`desktop.border`, `tablet.dimensions`, …). Theme-level defaults are stored flat and are handled
 * by `getDefaultStyles`, not here.
 *
 * @param nestedName the sub-property the option's styles move to, e.g. `'radio'` or `'checkbox'`.
 */
export const migrateStylesToNestedSet = <T extends object>(prev: T, nestedName: string): T => {
  const devices = ['desktop', 'tablet', 'mobile'] as const;

  const result = { ...prev } as T & Partial<Record<typeof devices[number], Record<string, unknown>>>;

  devices.forEach((device) => {
    const deviceStyles = result[device];
    if (!isDefined(deviceStyles) || typeof deviceStyles !== 'object') return;
    // Already migrated — don't nest a second time.
    if (isDefined(deviceStyles[nestedName])) return;

    const nested: Record<string, unknown> = {};
    const wrapper = { ...deviceStyles };

    for (const property of NESTED_STYLE_PROPERTIES) {
      if (!isDefined(wrapper[property])) continue;
      nested[property] = wrapper[property];
      delete wrapper[property];
    }

    if (Object.keys(nested).length > 0) result[device] = { ...wrapper, [nestedName]: nested };
  });

  return result;
};
