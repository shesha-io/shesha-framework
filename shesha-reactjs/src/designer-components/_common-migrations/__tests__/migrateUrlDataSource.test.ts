import { getReferenceListFromUrl, migrateUrlDataSource } from '../migrateUrlDataSource';

describe('getReferenceListFromUrl', () => {
  it('reads the reference list out of a ConfigurationItem URL', () => {
    const url = 'return "api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=Shesha.Core.Gender&module=Boxfusion.SheshaFunctionalTests.Web"';

    expect(getReferenceListFromUrl(url)).toEqual({
      name: 'Shesha.Core.Gender',
      module: 'Boxfusion.SheshaFunctionalTests.Web',
    });
  });

  it('treats a missing module as the null module', () => {
    const url = 'return "api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=Shesha.Core.Gender"';

    expect(getReferenceListFromUrl(url)).toEqual({ name: 'Shesha.Core.Gender', module: null });
  });

  it('reads the query string regardless of parameter order', () => {
    const url = 'return "api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&module=My.Mod&name=My.List"';

    expect(getReferenceListFromUrl(url)).toEqual({ name: 'My.List', module: 'My.Mod' });
  });

  it('reads the URL out of a JS setting stored in code mode', () => {
    const setting = {
      _mode: 'code' as const,
      _code: 'return "api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=Shesha.Core.Gender"',
      _value: '',
    };

    expect(getReferenceListFromUrl(setting)).toEqual({ name: 'Shesha.Core.Gender', module: null });
  });

  it('ignores URLs that are not reference-list lookups', () => {
    expect(getReferenceListFromUrl('return "api/services/app/Person/GetAll"')).toBeUndefined();
    expect(getReferenceListFromUrl('return "api/services/app/ConfigurationItem/GetCurrent?itemType=form&name=x"')).toBeUndefined();
  });

  it('returns undefined rather than throwing for absent or unusable values', () => {
    expect(getReferenceListFromUrl(undefined)).toBeUndefined();
    expect(getReferenceListFromUrl('')).toBeUndefined();
    expect(getReferenceListFromUrl('   ')).toBeUndefined();
    expect(getReferenceListFromUrl(42)).toBeUndefined();
  });

  it('refuses to resolve a name that is only known at runtime', () => {
    // Would otherwise yield a reference list literally named "${data.listName}".
    expect(getReferenceListFromUrl('return `api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=${data.listName}`')).toBeUndefined();
    expect(getReferenceListFromUrl('return "api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=" + data.listName')).toBeUndefined();
  });
});

describe('migrateUrlDataSource', () => {
  it('converts a reference-list URL to the native referenceList source', () => {
    const result = migrateUrlDataSource({
      dataSourceType: 'url',
      dataSourceUrl: 'return "api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=Shesha.Core.Gender&module=Boxfusion.SheshaFunctionalTests.Web"',
      reducerFunc: 'return data?.map(({itemValue, item }) => ({ value: itemValue, label: item }));',
    });

    expect(result).toEqual({
      dataSourceType: 'referenceList',
      referenceListId: { name: 'Shesha.Core.Gender', module: 'Boxfusion.SheshaFunctionalTests.Web' },
    });
  });

  it('drops the removed properties', () => {
    const result = migrateUrlDataSource({
      dataSourceType: 'url',
      dataSourceUrl: 'return "api/services/app/Person/GetAll"',
      reducerFunc: 'return data;',
    });

    expect(result).not.toHaveProperty('dataSourceUrl');
    expect(result).not.toHaveProperty('reducerFunc');
  });

  it('falls back to values when the URL cannot be resolved', () => {
    const result = migrateUrlDataSource({
      dataSourceType: 'url',
      dataSourceUrl: 'return "api/services/app/Person/GetAll"',
    });

    expect(result.dataSourceType).toBe('values');
    expect(result.referenceListId).toBeUndefined();
  });

  it('keeps an already-configured referenceListId over one parsed from the URL', () => {
    const result = migrateUrlDataSource({
      dataSourceType: 'url',
      dataSourceUrl: 'return "api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=Shesha.Core.Gender"',
      referenceListId: { name: 'Already.Configured', module: 'Some.Module' },
    });

    expect(result.referenceListId).toEqual({ name: 'Already.Configured', module: 'Some.Module' });
    expect(result.dataSourceType).toBe('referenceList');
  });

  it('leaves components that never used the url source untouched', () => {
    const values = { dataSourceType: 'values' as const, items: [{ id: '1', label: 'A', value: '1' }] };
    expect(migrateUrlDataSource(values)).toBe(values);

    const refList = { dataSourceType: 'referenceList' as const, referenceListId: { name: 'X', module: null } };
    expect(migrateUrlDataSource(refList)).toBe(refList);
  });
});
