import { IApiEndpoint } from "@/interfaces";
import { EntitiesManager } from "./manager";
import { IEntity, IEntityTypeIdentifier } from "./models";
import { isNullOrWhiteSpace } from "@/utils";

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
  // readonly _entityTypeId: IEntityTypeIdentifier;
  readonly moduleAccessor: string;

  readonly name: string;

  readonly _manager: EntitiesManager;

  constructor(manager: EntitiesManager, moduleAccessor: string, name: string) {
    this._manager = manager;
    this.moduleAccessor = moduleAccessor;
    this.name = name;
  }

  private getEntityTypeIdAsync = async (): Promise<IEntityTypeIdentifier> => {
    const moduleName = await this._manager._metadataFetcher.getModuleNameByAccessorAsync(this.moduleAccessor);
    if (isNullOrWhiteSpace(moduleName))
      throw new Error(`Failed to get module name by accessor '${this.moduleAccessor}'`);
    return { module: moduleName, name: this.name };
  };

  getApiEndpointsAsync = async (): Promise<IEntityEndpoints> => {
    const entityTypeId = await this.getEntityTypeIdAsync();
    return this._manager.getApiEndpointsAsync(entityTypeId);
  };

  createAsync = async (value: TEntity): Promise<TEntity> => {
    const entityTypeId = await this.getEntityTypeIdAsync();
    return this._manager.createEntityAsync<TId, TEntity>(entityTypeId, value);
  };

  getAsync = async (id: TId): Promise<TEntity> => {
    const entityTypeId = await this.getEntityTypeIdAsync();
    return this._manager.getEntityAsync<TId, TEntity>(entityTypeId, id);
  };

  updateAsync = async (value: TEntity): Promise<TEntity> => {
    const entityTypeId = await this.getEntityTypeIdAsync();
    return this._manager.updateEntityAsync<TId, TEntity>(entityTypeId, value);
  };

  deleteAsync = async (id: TId): Promise<void> => {
    const entityTypeId = await this.getEntityTypeIdAsync();
    return this._manager.deleteEntityAsync<TId>(entityTypeId, id);
  };
}
