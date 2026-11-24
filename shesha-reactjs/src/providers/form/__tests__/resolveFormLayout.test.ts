import { IFormDto, IFormSettings, resolveFormLayout } from '../models';
import { migrateFormSettings } from '../migration/formSettingsMigrations';

const theme = { layout: 'vertical' as const, labelSpan: 8, componentSpan: 16, labelAlign: 'left' as const };

describe('resolveFormLayout', () => {
  it('uses the theme for whatever the form left unset', () => {
    expect(resolveFormLayout({}, theme)).toEqual({
      layout: 'vertical', labelCol: { span: 8 }, wrapperCol: { span: 16 }, labelAlign: 'left',
    });
    expect(resolveFormLayout({ layout: 'horizontal', labelCol: { span: 10 } }, theme)).toEqual({
      layout: 'horizontal', labelCol: { span: 10 }, wrapperCol: { span: 16 }, labelAlign: 'left',
    });
    expect(resolveFormLayout({ labelCol: {}, wrapperCol: {} }, theme)).toMatchObject({
      layout: 'vertical', labelCol: { span: 8 }, wrapperCol: { span: 16 },
    });
  });

  it('keeps values the form set, even when they equal the old defaults', () => {
    expect(resolveFormLayout({ layout: 'horizontal', labelCol: { span: 6 }, wrapperCol: { span: 18 } }, theme)).toMatchObject({
      layout: 'horizontal', labelCol: { span: 6 }, wrapperCol: { span: 18 },
    });
  });

  it('keeps the other column settings when the spans are inherited', () => {
    expect(resolveFormLayout({ labelCol: { offset: 1 }, wrapperCol: { span: 20 } }, theme)).toMatchObject({
      labelCol: { span: 8, offset: 1 }, wrapperCol: { span: 20 },
    });
  });

  it('adds no theme span to a column sized with flex', () => {
    expect(resolveFormLayout({ labelCol: { flex: '100px' }, wrapperCol: { flex: 'auto', offset: 1 } }, theme)).toMatchObject({
      labelCol: { flex: '100px' }, wrapperCol: { flex: 'auto', offset: 1 },
    });
    expect(resolveFormLayout({ labelCol: { flex: '100px' } }, theme).labelCol).not.toHaveProperty('span');
  });

  it('derives the component span from the label span when the theme has none', () => {
    expect(resolveFormLayout(undefined, { labelSpan: 10 })).toMatchObject({ layout: 'horizontal', labelCol: { span: 10 }, wrapperCol: { span: 14 } });
  });

  it('falls back to the original form defaults when neither the form nor the theme sets them', () => {
    expect(resolveFormLayout({}, {})).toMatchObject({ layout: 'horizontal', labelCol: { span: 6 }, wrapperCol: { span: 18 } });
  });

  it('never applies the theme to settings forms', () => {
    expect(resolveFormLayout({ isSettingsForm: true, layout: 'vertical', labelCol: { span: 24 }, wrapperCol: { span: 24 } }, theme)).toEqual({
      layout: 'vertical', labelCol: { span: 24 }, wrapperCol: { span: 24 },
    });
  });

  it('inherits colon from the theme unless the form overrides it', () => {
    expect(resolveFormLayout({}, { ...theme, colon: false })).toMatchObject({ colon: false });
    expect(resolveFormLayout({ colon: true }, { ...theme, colon: false })).toMatchObject({ colon: true });
  });
});

describe('form settings migration to theme defaults', () => {
  const migrate = (settings: Partial<IFormSettings>): IFormSettings =>
    migrateFormSettings({ settings: { version: 10, ...settings } } as unknown as IFormDto, {}).settings;

  it('clears each value that still equals the old built-in default, field by field', () => {
    const result = migrate({ layout: 'horizontal', colon: true, labelCol: { span: 6 }, wrapperCol: { span: 18 } });
    expect(result).not.toHaveProperty('layout');
    expect(result).not.toHaveProperty('colon');
    expect(result).not.toHaveProperty('labelCol');
    expect(result).not.toHaveProperty('wrapperCol');

    expect(migrate({ layout: 'vertical', labelCol: { span: 6 }, wrapperCol: { span: 18 } })).toEqual(expect.objectContaining({ layout: 'vertical' }));
    expect(migrate({ layout: 'vertical', labelCol: { span: 6 }, wrapperCol: { span: 18 } })).not.toHaveProperty('labelCol');
  });

  it('keeps the horizontal layout of a form with its own spans', () => {
    expect(migrate({ layout: 'horizontal', labelCol: { span: 8 }, wrapperCol: { span: 16 } })).toMatchObject({ layout: 'horizontal', labelCol: { span: 8 } });
    expect(migrate({ layout: 'horizontal', labelCol: { span: 6 }, wrapperCol: { span: 12 } })).toMatchObject({ layout: 'horizontal', wrapperCol: { span: 12 } });
  });

  it('keeps the other column settings of a default span', () => {
    expect(migrate({ labelCol: { span: 6, offset: 1 } }).labelCol).toEqual({ offset: 1 });
  });

  it('keeps values that were overridden', () => {
    expect(migrate({ layout: 'vertical', colon: false, labelCol: { span: 8 }, wrapperCol: { span: 16 } }))
      .toMatchObject({ layout: 'vertical', colon: false, labelCol: { span: 8 }, wrapperCol: { span: 16 } });
  });

  it('leaves new forms without layout so they follow the theme', () => {
    const result = migrateFormSettings({ settings: undefined } as unknown as IFormDto, {}).settings;
    expect(result.layout).toBeUndefined();
    expect(result.labelCol).toBeUndefined();
    expect(result.colon).toBeUndefined();
  });

  it('does not touch values saved after the migration ran', () => {
    const saved = { version: 11, layout: 'horizontal', labelCol: { span: 6 }, wrapperCol: { span: 18 } };
    expect(migrateFormSettings({ settings: saved } as unknown as IFormDto, {}).settings).toMatchObject({ layout: 'horizontal', labelCol: { span: 6 } });
  });
});
