import { IHasVersion, Migrator } from '../migrator';
interface V1Model extends IHasVersion {
    name: string;
}

interface V2Model extends IHasVersion {
    name: string;
    label: string;
}

interface V3Model extends IHasVersion {
    path: string;
    description: string | null;
}

describe('Given 2 migrations', () => {
  const registration = new Migrator<V1Model, V3Model>()
    .add<V2Model>(0, prev => ({ ...prev, label: '123' }))
    .add<V3Model>(1, prev => ({ ...prev, description: 'description!', path: prev.name }));

  test('Then I expect 2 migrations is registered', () => {
      expect(registration.migrator.migrations.length).toEqual(2);
  });

  test('Then I expect model migrated to the last verson with result check', () => {
      const source: V1Model = { name: 'Lorem ipsum', version: -1 };
      
      const dst = registration.migrator.upgrade(source);

      expect(dst.path).toEqual('Lorem ipsum');
      expect(dst.description).toEqual('description!');
      expect(dst.version).toEqual(1);
  });
});
