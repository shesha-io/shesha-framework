export interface IHasVersion {
  version?: number | 'latest';
}

export type Migration<TPrev = IHasVersion, TNext = IHasVersion, TContext = any> = (
  prev: TPrev,
  context: TContext
) => TNext;
export interface MigrationRegistration<TPrev = IHasVersion, TNext = IHasVersion> {
  version: number;
  up: Migration<TPrev, TNext>;
}

export const isHasVersion = (value: any): value is IHasVersion  => {
  const version = (value as IHasVersion)?.version;
  return version && (typeof(version) === 'number' || version === 'latest');
};

export interface IAddMigrationPayload<TModel = IHasVersion, TNext = IHasVersion> {
  version: number;
  migration: Migration<TModel, TNext>;
}

interface IMigrationRegistrationsOwner<TDst = IHasVersion, TContext = any> {
  addMigration: <TModel, TNext>(payload: IAddMigrationPayload<TModel, TNext>) => void;
  migrations: MigrationRegistration[];
  upgrade: (currentModel: IHasVersion, context: TContext) => TDst;
}

export class MigratorFluent<TModel = IHasVersion, TDst = IHasVersion, TContext = any> {
  readonly migrator: IMigrationRegistrationsOwner<TDst>;

  constructor(owner: IMigrationRegistrationsOwner<TDst>) {
    this.migrator = owner;
  }

  add = <TNext = IHasVersion>(version: number, migration: Migration<TModel, TNext, TContext>) => {
    this.migrator.addMigration<TModel, TNext>({ version, migration });

    const fluent = new MigratorFluent<TNext, TDst, TContext>(this.migrator);
    return fluent;
  };

  get lastVersion(): number | undefined {
    const maxVersion = Math.max(...this.migrator.migrations.map((item) => item.version), -1);
    return maxVersion === -1 ? undefined : maxVersion;
  }
}

export class Migrator<TSrc = IHasVersion, TDst = IHasVersion, TContext = any>
  implements IMigrationRegistrationsOwner<TDst> {
  migrations: MigrationRegistration[];

  constructor() {
    this.migrations = [];
  }

  addMigration = <TSrc, TNext>(payload: IAddMigrationPayload<TSrc, TNext>) => {
    const registration: MigrationRegistration<TSrc, TNext> = {
      version: payload.version,
      up: payload.migration,
    };
    if (this.migrations.find((m) => m.version === payload.version))
      throw `Migration with version ${payload.version} already registered`;

    this.migrations.push(registration as unknown as MigrationRegistration);
  };

  add = <TNext = IHasVersion>(version: number, migration: Migration<TSrc, TNext>) => {
    this.addMigration<TSrc, TNext>({ version, migration });

    return new MigratorFluent<TNext, TDst, TContext>(this);
  };

  upgrade = (currentModel: IHasVersion, context: TContext): TDst => {
    if (currentModel.version !== 'latest') {
      const versionNumber = currentModel.version as number;
      const unappliedMigrations = this.migrations.filter((m) => m.version > versionNumber).sort((m) => m.version);

      let current = { ...currentModel };
      unappliedMigrations.forEach((migration) => {
        current = migration.up(current, context);
        current.version = migration.version;
      });
      return current as TDst;
    } else {
      return currentModel as TDst;
    }
  };
}
