import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import { getSettings } from '../settingsForm';

const findAll = (value: unknown, match: (node: Record<string, unknown>) => boolean): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.flatMap((item) => findAll(item, match));
  if (typeof value !== 'object' || value === null) return [];
  const node = Object.fromEntries(Object.entries(value));
  return [...(match(node) ? [node] : []), ...Object.values(node).flatMap((child) => findAll(child, match))];
};

describe('CustomLayout settings form', () => {
  const markup = getSettings({ fbf: makeFormBuliderFactory(getComponentDefinitions()), removeStyleRouter: false });

  // Refs #4804 QA - the first tab is titled Main; its key is unchanged so saved state still resolves
  test('first tab is titled Main', () => {
    const [tabs] = findAll(markup, (node) => node['propertyName'] === 'settingsTabs');
    const [first] = findAll(tabs?.['tabs'], (node) => node['key'] === 'common');

    expect(first?.['title']).toBe('Main');
  });

  // Refs #4804 QA - the heading can be centred
  test('heading alignment offers left, center and right', () => {
    const [labelConfigurator] = findAll(markup, (node) => node['type'] === 'labelConfigurator');
    const values = findAll(labelConfigurator?.['labelAlignOptions'], (node) => 'value' in node).map((node) => node['value']);

    expect(values).toEqual(['left', 'center', 'right']);
  });
});
