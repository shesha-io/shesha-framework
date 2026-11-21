import { buildTestMarkup, getTestDefinition, sampleForm } from '@/providers/formDesigner/__tests__/testMarkup';
import { buildLayersIndex } from '../buildLayersIndex';
import { searchLayers } from '../search';

const markup = buildTestMarkup(sampleForm());
const index = buildLayersIndex(markup, getTestDefinition);
const matchesFor = (query: string): string[] => [...(searchLayers(index, markup, getTestDefinition, query)?.matches ?? [])].sort();

describe('searchLayers()', () => {
  it('returns nothing for a blank query', () => {
    expect(searchLayers(index, markup, getTestDefinition, '   ')).toBeUndefined();
  });

  it('matches labels, keeping the ancestors visible', () => {
    const result = searchLayers(index, markup, getTestDefinition, 'PHONE');
    expect([...(result?.matches ?? [])]).toEqual(['phone']);
    expect([...(result?.visible ?? [])].sort()).toEqual(['pane-a', 'phone', 'tabs1']);
  });

  it('matches component names, property names and types', () => {
    expect(matchesFor('btnsave')).toEqual(['save']);
    expect(matchesFor('address.city')).toEqual(['city']);
    expect(matchesFor('textfield')).toEqual(['city', 'email', 'linkText', 'phone']);
  });

  it('matches pane titles', () => {
    expect(matchesFor('address')).toEqual(['city', 'pane-b']);
  });
});
