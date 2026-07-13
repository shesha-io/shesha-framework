import { isDefined } from "../nullables";

export interface IHasVersion {
  version?: number | 'latest' | undefined;
}

export type Migration<TPrev = IHasVersion, TNext = IHasVersion, TContext extends object = object> = (
  prev: TPrev,
  context: TContext,
) => TNext;
export interface MigrationRegistration<TPrev = IHasVersion, TNext = IHasVersion, TContext extends object = object> {
  version: number;
  up: Migration<TPrev, TNext, TContext>;
}

export const isHasVersion = (value: unknown): value is IHasVersion => {
  return isDefined(value) && "version" in value && (typeof (value.version) === 'number' || value.version === 'latest');
};

export interface IAddMigrationPayload<TModel extends IHasVersion = IHasVersion, TNext extends IHasVersion = IHasVersion, TContext extends object = object> {
  version: number;
  migration: Migration<TModel, TNext, TContext>;
}

interface IMigrationRegistrationsOwner<TDst extends IHasVersion = IHasVersion, TContext extends object = object> {
  addMigration: <TModel extends IHasVersion, TNext extends IHasVersion>(payload: IAddMigrationPayload<TModel, TNext, TContext>) => void;
  migrations: MigrationRegistration[];
  upgrade: (currentModel: IHasVersion, context: TContext) => TDst;
}

export class MigratorFluent<TModel extends IHasVersion = IHasVersion, TDst extends IHasVersion = IHasVersion, TContext extends object = object> {
  readonly migrator: IMigrationRegistrationsOwner<TDst, TContext>;

  constructor(owner: IMigrationRegistrationsOwner<TDst, TContext>) {
    this.migrator = owner;
  }

  add = <TNext extends IHasVersion = IHasVersion>(version: number, migration: Migration<TModel, TNext, TContext>): MigratorFluent<TNext, TDst, TContext> => {
    this.migrator.addMigration<TModel, TNext>({ version, migration });

    const fluent = new MigratorFluent<TNext, TDst, TContext>(this.migrator);
    return fluent;
  };

  get lastVersion(): number | undefined {
    const maxVersion = Math.max(...this.migrator.migrations.map((item) => item.version), -1);
    return maxVersion === -1 ? undefined : maxVersion;
  }
}

export class Migrator<TSrc extends IHasVersion = IHasVersion, TDst extends IHasVersion = IHasVersion, TContext extends object = object>
implements IMigrationRegistrationsOwner<TDst, TContext> {
  migrations: MigrationRegistration[];

  constructor() {
    this.migrations = [];
  }

  addMigration = <TSrc extends IHasVersion, TNext extends IHasVersion>(payload: IAddMigrationPayload<TSrc, TNext, TContext>): void => {
    const registration: MigrationRegistration<TSrc, TNext, TContext> = {
      version: payload.version,
      up: payload.migration,
    };
    if (this.migrations.find((m) => m.version === payload.version))
      throw `Migration with version ${payload.version} already registered`;

    this.migrations.push(registration as unknown as MigrationRegistration);
  };

  add = <TNext extends IHasVersion = IHasVersion>(version: number, migration: Migration<TSrc, TNext>): MigratorFluent<TNext, TDst, TContext> => {
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
