import { IComponentContainerInfo } from '@/providers/form/utils';
import { testComponent } from '../../__tests__/testMarkup';
import { getComponentDisplayText, getPaneGroupNoun, getPaneLabel } from '../displayText';

const pane = (value: { propertyName: string; source: object; index?: number }): IComponentContainerInfo => ({
  id: 'p1',
  components: [],
  isNested: false,
  ...value,
});

describe('getComponentDisplayText()', () => {
  it('prefers the label, then the component name, then the type', () => {
    expect(getComponentDisplayText(testComponent({ id: 'a', type: 'textField', label: 'Email', componentName: 'txtEmail' }))).toBe('Email');
    expect(getComponentDisplayText(testComponent({ id: 'a', type: 'textField', label: ' ', componentName: 'txtEmail' }))).toBe('txtEmail');
    expect(getComponentDisplayText(testComponent({ id: 'a', type: 'textField' }))).toBe('textField (no name)');
  });
});

describe('getPaneLabel()', () => {
  it("uses the pane's own title", () => {
    expect(getPaneLabel(pane({ propertyName: 'tabs', index: 0, source: { title: 'Details' } }))).toBe('Details');
  });

  it('numbers panes without a title', () => {
    expect(getPaneLabel(pane({ propertyName: 'columns', index: 1, source: {} }))).toBe('Column 2');
  });

  it('names single sections', () => {
    expect(getPaneLabel(pane({ propertyName: 'header', source: {} }))).toBe('Header');
    expect(getPaneLabel(pane({ propertyName: 'stepFooter', source: {} }))).toBe('Footer');
  });
});

describe('getPaneGroupNoun()', () => {
  it('says tabs, steps or columns, and sections otherwise', () => {
    expect(getPaneGroupNoun([pane({ propertyName: 'tabs', source: {} })])).toBe('tabs');
    expect(getPaneGroupNoun([pane({ propertyName: 'header', source: {} }), pane({ propertyName: 'content', source: {} })])).toBe('sections');
  });
});
