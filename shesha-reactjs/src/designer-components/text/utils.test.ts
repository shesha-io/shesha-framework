import { IStyleValue } from '@/interfaces';
import { ContentType, ITextComponentProps } from './models';
import { migrateDefaultContentType } from './utils';

/** A device's settings as the Text settings form stores them: style values plus its own Type. */
type TextDeviceModel = IStyleValue & { contentType?: ContentType | undefined };

const device = (contentType?: ContentType): TextDeviceModel => (contentType === undefined ? {} : { contentType });

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
    const migrated = migrateDefaultContentType(text({ desktop: device('primary'), tablet: device(), mobile: device() }));
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
    const migrated = migrateDefaultContentType(text({ desktop: device('primary'), tablet: device('') }));
    expect(migrated.tablet).toEqual({ contentType: 'default' });
  });
});
