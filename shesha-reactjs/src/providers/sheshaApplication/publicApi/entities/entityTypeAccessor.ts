import { IApiEndpoint, IEntityMetadata } from "@/interfaces";
import { EntitiesManager } from "./manager";
import { IEntity, IEntityTypeIndentifier } from "./models";

export interface IEntityEndpoints extends Record<string, IApiEndpoint> {
  create?: IApiEndpoint;
  read?: IApiEndpoint;
  update?: IApiEndpoint;
  delete?: IApiEndpoint;
}

/**
 * Entities accessor. It allows to manipulate entities.
 */
export interface IEntityTypeAccessor<TId, TEntity extends IEntity<TId>> {
  createAsync: (value: TEntity) => Promise<TEntity>;
  getAsync: (id: TId) => Promise<TEntity>;
  updateAsync: (value: TEntity) => Promise<TEntity>;
  deleteAsync: (id: TId) => Promise<void>;
  getApiEndpointsAsync: () => Promise<IEntityEndpoints>;
}
/**
 * Entities accessor. It allows to manipulate entities.
 */
export class EntityTypeAccessor<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> implements IEntityTypeAccessor<TId, TEntity> {
  readonly _entityTypeId: IEntityTypeIndentifier;

  readonly _manager: EntitiesManager;

  readonly _metadata: Promise<IEntityMetadata>;

  constructor(manager: EntitiesManager, moduleAccessor: string, name: string) {
    this._manager = manager;
    this._entityTypeId = { module: moduleAccessor, name };
  }

  getApiEndpointsAsync = (): Promise<IEntityEndpoints> => {
    return this._manager.getApiEndpointsAsync(this._entityTypeId);
  };

  createAsync = (value: TEntity): Promise<TEntity> => {
    return this._manager.createEntityAsync<TId, TEntity>(this._entityTypeId, value);
  };

  getAsync = (id: TId): Promise<TEntity> => {
    return this._manager.getEntityAsync<TId, TEntity>(this._entityTypeId, id);
  };

  updateAsync = (value: TEntity): Promise<TEntity> => {
    return this._manager.updateEntityAsync<TId, TEntity>(this._entityTypeId, value);
  };

  deleteAsync = (id: TId): Promise<void> => {
    return this._manager.deleteEntityAsync<TId>(this._entityTypeId, id);
  };
}
