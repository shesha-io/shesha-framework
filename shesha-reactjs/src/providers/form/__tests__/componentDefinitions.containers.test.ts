import { getComponentDefinitions } from '../defaults/toolboxComponents';

describe('component definitions: own child containers', () => {
  const definitions = getComponentDefinitions();

  it.each([
    'container', 'containerChecker', 'customLayout', 'dataContext', 'datatableContext',
    'drawer', 'processMonitor', 'propertyRouter', 'space', 'setting',
  ])('%s says it accepts children', (type) => {
    expect(definitions.get(type)?.acceptsChildren).toBe(true);
  });

  it('limits Link to one child', () => {
    expect(definitions.get('link')?.itemsLimit).toBe(1);
  });

  // a Link draws its container only with Custom Link on, so it claims one only once it holds a component
  it.each(['link', 'tabs', 'wizard', 'columns', 'collapsiblePanel', 'textField', 'button'])('%s does not claim its own child container', (type) => {
    expect(definitions.get(type)?.acceptsChildren).not.toBe(true);
  });
});
