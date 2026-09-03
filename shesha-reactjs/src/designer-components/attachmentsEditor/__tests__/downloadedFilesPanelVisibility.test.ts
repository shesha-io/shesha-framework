import { executeScriptSync } from '@/providers/form/utils/scripts';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import { IConfigurableFormComponent } from '@/interfaces';
import { getSettings } from '../settingsForm';

/**
 * The Downloaded Files panel is gated on Style Downloaded Files, which is device-scoped. The theme
 * settings page renders these settings with the style router removed, so the settings sit flat on
 * `data` rather than under a device — and a condition written for the device case alone read
 * `data.desktop`, found nothing, and hid the panel there entirely.
 *
 * executeScriptSync swallows a throw and a missing property alike, returning undefined, which reads
 * as "not visible" — so the condition is checked by running it against both shapes of data.
 */
/**
 * Only a list of objects is worth walking. Recursing into any array would descend into an array of
 * strings, and `Object.values` of a string yields its characters as more strings — so a single string
 * anywhere in the markup would recur until the stack ran out. Everything `walk` reads off a member is
 * safe on any object, which is exactly what this checks for.
 */
const isComponentList = (value: unknown): value is IConfigurableFormComponent[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null);

/** The child components a markup value holds — itself when it is a list, or its `components`. */
const childComponents = (value: unknown): IConfigurableFormComponent[] | undefined => {
  if (isComponentList(value)) return value;
  if (typeof value === 'object' && value !== null && 'components' in value && isComponentList(value.components))
    return value.components;
  return undefined;
};

/**
 * The condition a component is gated on. `visible` is declared as a plain boolean, but the builder
 * stores a code evaluator there, so it is read back as unknown and narrowed rather than asserted.
 */
const visibilityCode = (component: IConfigurableFormComponent): string | undefined => {
  const visible: unknown = component.visible;
  return typeof visible === 'object' && visible !== null && '_code' in visible && typeof visible._code === 'string'
    ? visible._code
    : undefined;
};

describe('Downloaded Files panel visibility', () => {
  const conditionFor = (removeStyleRouter: boolean): string => {
    const markup = getSettings({ fbf: makeFormBuliderFactory(getComponentDefinitions()), removeStyleRouter });

    /* The panel is nested several containers deep, so it is found by walking rather than by index. */
    const walk = (list: IConfigurableFormComponent[]): IConfigurableFormComponent | undefined => {
      for (const component of list) {
        if (component.type === 'collapsiblePanel' && component.label === 'Downloaded Files') return component;
        for (const value of Object.values(component)) {
          const children = childComponents(value);
          const found = children ? walk(children) : undefined;
          if (found) return found;
        }
      }
      return undefined;
    };

    const root = childComponents(markup);
    if (!root) throw new Error('Settings markup is not a list of components');

    const panel = walk(root);
    if (!panel) throw new Error('Downloaded Files panel not found in the settings markup');

    const code = visibilityCode(panel);
    if (code === undefined) throw new Error('Downloaded Files panel carries no visibility condition');
    return code;
  };

  const run = (script: string, data: object, designerDevice = 'desktop'): unknown =>
    executeScriptSync(script, {
      data,
      contexts: { canvasContext: { designerDevice } },
      getSettingValue: (value: unknown) => value,
    });

  it('shows on the theme settings page, where the settings are flat', () => {
    const script = conditionFor(true);

    expect(run(script, { styleDownloadedFiles: true })).toBe(true);
    expect(run(script, { styleDownloadedFiles: false })).toBe(false);
  });

  it('reads the edited device in the form designer', () => {
    const script = conditionFor(false);
    const data = { desktop: { styleDownloadedFiles: true }, mobile: { styleDownloadedFiles: false } };

    expect(run(script, data, 'desktop')).toBe(true);
    expect(run(script, data, 'mobile')).toBe(false);
  });

  /* The shape of the original defect, kept so the reason the condition is built per call site cannot
     be optimised away: reaching through a device that is not there yields undefined, and undefined
     hides the panel. Nothing here touches the component — it pins the behaviour of the path itself. */
  it('is why a device-only condition could not work on the theme settings page', () => {
    const deviceOnly = 'return !!getSettingValue(data?.[`${contexts?.canvasContext?.designerDevice || "desktop"}`]?.styleDownloadedFiles);';

    expect(run(deviceOnly, { styleDownloadedFiles: true })).toBe(false);
    expect(run(deviceOnly, { desktop: { styleDownloadedFiles: true } })).toBe(true);
  });
});
