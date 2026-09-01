import { executeScriptSync } from '@/providers/form/utils/scripts';
import { FormBuilderImplementation } from '../implementation';
import { ICollapsiblePanelComponentProps } from '@/designer-components/collapsiblePanel/interfaces';

/**
 * The `visibleJs` a panel is gated on runs through executeScriptSync, which wraps it in
 * `with(context) { ... }` inside a `new Function` and swallows any error — a throw or a missing
 * property both come back as undefined, which reads as "hide the panel". So the generated script is
 * checked by running it, not by matching its text: a condition that silently never matches would
 * otherwise look fine in the source and hide the panel in the designer.
 */
describe('device-scoped panel visibility', () => {
  /* `_addProperty` turns `visibleJs` into a `visible` code evaluator, so the generated script is read
     back off that rather than off the property the builder was handed. */
  const build = (visibleJs?: string, isResponsive?: boolean): string | undefined => {
    const builder = new FormBuilderImplementation(undefined);
    builder.stdFontPanel(isResponsive, 'font', undefined, 'Font', visibleJs);
    const panel = builder.toJson()[0] as unknown as ICollapsiblePanelComponentProps & {
      visible?: { _code?: string } | undefined;
    };
    return panel.visible?._code;
  };

  /** The bag a settings script actually gets: form data, plus the contexts the providers bind. */
  const context = (designerDevice: string, data: object): object => ({
    data,
    contexts: { canvasContext: { designerDevice } },
    getSettingValue: (value: unknown) => value,
  });

  it('reads the edited device’s slice when the panel is behind a property router', () => {
    const script = build('return !!getSettingValue(device?.styleDownloadedFiles);', true)!;
    const data = {
      desktop: { styleDownloadedFiles: true },
      mobile: { styleDownloadedFiles: false },
    };

    expect(executeScriptSync(script, context('desktop', data))).toBe(true);
    expect(executeScriptSync(script, context('mobile', data))).toBe(false);
  });

  it('reads the root when there is no property router', () => {
    const script = build('return !!getSettingValue(device?.styleDownloadedFiles);', false)!;

    expect(executeScriptSync(script, context('mobile', { styleDownloadedFiles: true }))).toBe(true);
    expect(executeScriptSync(script, context('mobile', { styleDownloadedFiles: false }))).toBe(false);
  });

  it('leaves a panel with no condition unconditional', () => {
    expect(build(undefined, true)).toBeUndefined();
  });
});
