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
describe('Downloaded Files panel visibility', () => {
  const conditionFor = (removeStyleRouter: boolean): string => {
    const markup = getSettings({ fbf: makeFormBuliderFactory(getComponentDefinitions()), removeStyleRouter });
    const components = 'components' in markup ? markup.components : markup;

    /* The panel is nested several containers deep, so it is found by walking rather than by index. */
    const walk = (list: IConfigurableFormComponent[]): IConfigurableFormComponent | undefined => {
      for (const component of list) {
        if (component.type === 'collapsiblePanel' && component.label === 'Downloaded Files') return component;
        for (const value of Object.values(component)) {
          const nested = Array.isArray(value)
            ? walk(value as IConfigurableFormComponent[])
            : (typeof value === 'object' && value !== null && 'components' in value
              ? walk((value as { components: IConfigurableFormComponent[] }).components)
              : undefined);
          if (nested) return nested;
        }
      }
      return undefined;
    };

    const panel = walk(components as IConfigurableFormComponent[]);
    if (!panel) throw new Error('Downloaded Files panel not found in the settings markup');

    const visible = (panel as unknown as { visible?: { _code?: string } }).visible;
    if (typeof visible?._code !== 'string') throw new Error('Downloaded Files panel carries no visibility condition');
    return visible._code;
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
