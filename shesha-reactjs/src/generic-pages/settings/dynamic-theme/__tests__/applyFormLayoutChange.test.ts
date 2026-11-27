import { applyFormLayoutChange } from '../formLayoutSettingsPanel';

const theme = {
  layout: 'vertical' as const, labelSpan: 6, componentSpan: 18, colon: true,
  componentGroups: { input: { font: { size: 10 }, labelFont: { size: 14, weight: '500', type: 'Inter', color: '#000' } } },
};

describe('applyFormLayoutChange', () => {
  it('applies layout, span, align and colon even when the label font is reported alongside them', () => {
    // The settings form reports every field on each change, the label font included.
    const result = applyFormLayoutChange(theme, {
      layout: 'horizontal', labelSpan: 8, labelAlign: 'left', colon: false, labelFont: { size: 12 },
    });
    expect(result).toMatchObject({
      layout: 'horizontal', labelSpan: 8, componentSpan: 16, labelAlign: 'left', colon: false,
      componentGroups: { input: { font: { size: 10 }, labelFont: { size: 12, weight: '500', type: 'Inter', color: '#000' } } },
    });
    // The label font belongs to the Input Components group, never the top-level (legacy) key.
    expect(result.labelFont).toBeUndefined();
  });

  it('leaves the spans alone when the label span is not reported (hidden in vertical layout)', () => {
    expect(applyFormLayoutChange(theme, { layout: 'vertical', colon: false })).toMatchObject({ labelSpan: 6, componentSpan: 18, colon: false });
  });

  it('keeps the rest of the theme', () => {
    const full = { ...theme, layoutBackground: '#fff' };
    expect(applyFormLayoutChange(full, { layout: 'horizontal' })).toMatchObject({ layoutBackground: '#fff', componentGroups: { input: { font: { size: 10 } } } });
  });
});
