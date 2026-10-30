import { resolveFormLayout } from '../models';

const theme = { layout: 'vertical' as const, labelSpan: 8, componentSpan: 16, labelAlign: 'left' as const };

describe('resolveFormLayout', () => {
  it('uses the theme for a form still on the built-in default layout', () => {
    expect(resolveFormLayout({ layout: 'horizontal', labelCol: { span: 6 }, wrapperCol: { span: 18 } }, theme)).toEqual({
      layout: 'vertical', labelCol: { span: 8 }, wrapperCol: { span: 16 }, labelAlign: 'left',
    });
  });

  it('uses the theme for whatever the form left unset', () => {
    expect(resolveFormLayout({ layout: 'horizontal', labelCol: { span: 10 } }, theme)).toEqual({
      layout: 'horizontal', labelCol: { span: 10 }, wrapperCol: { span: 16 }, labelAlign: 'left',
    });
    expect(resolveFormLayout({ labelCol: {}, wrapperCol: {} }, theme)).toMatchObject({
      layout: 'vertical', labelCol: { span: 8 }, wrapperCol: { span: 16 },
    });
  });

  it('keeps a layout the form chose', () => {
    expect(resolveFormLayout({ layout: 'horizontal', labelCol: { span: 4 }, wrapperCol: { span: 20 } }, theme)).toMatchObject({
      layout: 'horizontal', labelCol: { span: 4 }, wrapperCol: { span: 20 },
    });
  });

  it('derives the component span from the label span when the theme has none', () => {
    expect(resolveFormLayout(undefined, { labelSpan: 10 })).toMatchObject({ layout: 'horizontal', labelCol: { span: 10 }, wrapperCol: { span: 14 } });
  });

  it('never applies the theme to settings forms', () => {
    expect(resolveFormLayout({ isSettingsForm: true, layout: 'vertical', labelCol: { span: 24 }, wrapperCol: { span: 24 } }, theme)).toEqual({
      layout: 'vertical', labelCol: { span: 24 }, wrapperCol: { span: 24 },
    });
  });
});
