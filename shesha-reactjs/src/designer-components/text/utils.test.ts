import { ITextComponentProps } from './models';
import { migrateDefaultContentType } from './utils';

const text = (overrides: Partial<ITextComponentProps>): ITextComponentProps => ({ id: 'text', type: 'text', propertyName: 'text', content: undefined, ...overrides });

describe('migrateDefaultContentType', () => {
  it('gives a text with no Type anywhere the default Type on every device', () => {
    const migrated = migrateDefaultContentType(text({ desktop: {}, tablet: {}, mobile: {} }));
    expect(migrated.contentType).toBe('default');
    expect(migrated.desktop).toEqual({ contentType: 'default' });
    expect(migrated.tablet).toEqual({ contentType: 'default' });
    expect(migrated.mobile).toEqual({ contentType: 'default' });
  });

  it('leaves tablet and mobile unset so they keep inheriting a desktop Type', () => {
    const migrated = migrateDefaultContentType(text({ desktop: { contentType: 'primary' } as object, tablet: {}, mobile: {} }));
    expect(migrated.desktop).toEqual({ contentType: 'primary' });
    expect(migrated.tablet).toEqual({});
    expect(migrated.mobile).toEqual({});
  });

  it('leaves devices unset so they keep inheriting a root Type', () => {
    const migrated = migrateDefaultContentType(text({ contentType: 'secondary', desktop: {}, tablet: {} }));
    expect(migrated.contentType).toBe('secondary');
    expect(migrated.desktop).toEqual({});
    expect(migrated.tablet).toEqual({});
  });

  it('turns an explicitly empty Type into default even when one would be inherited', () => {
    const migrated = migrateDefaultContentType(text({ desktop: { contentType: 'primary' } as object, tablet: { contentType: '' } as object }));
    expect(migrated.tablet).toEqual({ contentType: 'default' });
  });
});
