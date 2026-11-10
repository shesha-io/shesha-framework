import { getDropDirection } from './dropDirection';
import { DROP_TARGET_DIRECTION_ATTR } from './models';

const createContainer = (style: Partial<CSSStyleDeclaration>, declared?: string): HTMLElement => {
  const container = document.createElement('div');
  Object.assign(container.style, style);
  if (declared !== undefined) container.setAttribute(DROP_TARGET_DIRECTION_ATTR, declared);
  document.body.appendChild(container);
  return container;
};

describe('getDropDirection', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('treats a block container as a column', () => {
    expect(getDropDirection(createContainer({ display: 'block' }))).toBe('vertical');
  });

  it.each(['row', 'row-reverse'])('treats a flex %s as a row', (flexDirection) => {
    expect(getDropDirection(createContainer({ display: 'flex', flexDirection }))).toBe('horizontal');
  });

  it('treats a flex container without a direction as a row', () => {
    expect(getDropDirection(createContainer({ display: 'inline-flex' }))).toBe('horizontal');
  });

  it.each(['column', 'column-reverse'])('treats a flex %s as a column', (flexDirection) => {
    expect(getDropDirection(createContainer({ display: 'flex', flexDirection }))).toBe('vertical');
  });

  it('treats a grid with several columns as a row', () => {
    expect(getDropDirection(createContainer({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }))).toBe('horizontal');
  });

  it('treats a single-column grid as a column', () => {
    expect(getDropDirection(createContainer({ display: 'grid', gridTemplateColumns: '1fr' }))).toBe('vertical');
  });

  it('keeps a container declared horizontal as a row whatever its styling', () => {
    expect(getDropDirection(createContainer({ display: 'block' }, 'horizontal'))).toBe('horizontal');
  });
});
