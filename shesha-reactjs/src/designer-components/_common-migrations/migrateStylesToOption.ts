import { IStyleValue } from '@/providers/form/models';
import { isDefined } from '@/utils/nullables';

/** The Appearance style properties that make up one style set. */
const STYLE_PROPERTIES = ['font', 'dimensions', 'border', 'background', 'shadow', 'stylingBoxJson', 'style'] as const;

/**
 * A style model for an option component (radio, checkbox group): the bare-named properties style
 * the component wrapper, and the nested `option` set styles each repeated option.
 */
export type IOptionStyleValue = IStyleValue & { option?: IStyleValue | undefined };

type StyleSet = IOptionStyleValue;

/**
 * Moves an existing single style set onto the `option` sub-property.
 *
 * Option components (radio, checkbox group) used to expose one set of Appearance panels whose
 * values styled the *repeated option*. They now expose two sets: the bare-named properties style
 * the component wrapper, and `option.*` styles each option. Without this migration every saved
 * form's styling would silently jump from the option to the wrapper.
 *
 * Only the per-device buckets are rewritten, because that is where the style router binds
 * (`desktop.border`, `tablet.font`, …). Theme-level defaults are stored flat and are handled by
 * `getDefaultStyles`, not here.
 */
export const migrateStylesToOption = <T extends object>(prev: T): T => {
  const devices = ['desktop', 'tablet', 'mobile'] as const;

  const result = { ...prev } as T & Partial<Record<typeof devices[number], StyleSet>>;

  devices.forEach((device) => {
    const deviceStyles = result[device];
    if (!isDefined(deviceStyles) || typeof deviceStyles !== 'object') return;
    // Already migrated — don't nest a second time.
    if (isDefined(deviceStyles.option)) return;

    const option: Record<string, unknown> = {};
    const wrapper = { ...deviceStyles } as Record<string, unknown>;

    for (const property of STYLE_PROPERTIES) {
      if (!isDefined(wrapper[property])) continue;
      option[property] = wrapper[property];
      delete wrapper[property];
    }

    if (Object.keys(option).length > 0) result[device] = { ...wrapper, option } as StyleSet;
  });

  return result;
};
