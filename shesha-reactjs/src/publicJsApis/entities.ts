/*
 * Entity with typed id
 */
export interface IEntity<TId = string> {
  id: TId;
};

export interface IDeletionAuditedEntity {
  /** Deleter User Id */
  deleterUserId?: number;
  /** Deletion Time */
  deletionTime?: Date;
  /** Is Deleted */
  isDeleted: boolean;
}

export interface ICreationAuditedEntity {
  /** Creation Time */
  creationTime: Date;
  /** Creator User Id */
  creatorUserId?: number;
}

export interface IModificationAuditedEntity {
  /** Last Modification Time */
  lastModificationTime?: Date;
  /** Last Modifier User Id */
  lastModifierUserId?: number;
}

export interface IFullAudited extends IDeletionAuditedEntity, ICreationAuditedEntity, IModificationAuditedEntity {

}
export interface IFullAuditedEntity<TId = string> extends IEntity<TId>, IFullAudited {

}

export type EntityCreatePayload<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> = Omit<TEntity, keyof IFullAuditedEntity<TId>>;
export type EntityUpdatePayload<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> = Partial<Omit<TEntity, keyof IFullAudited>> & Pick<TEntity, "id">;

export interface IApiEndpoint {
  /** Http verb (get/post/put etc) */
  httpVerb: string;
  /** Url */
  url: string;
}

export interface IEntityEndpoints extends Record<string, IApiEndpoint> {
  create: IApiEndpoint;
  read: IApiEndpoint;
  update: IApiEndpoint;
  delete: IApiEndpoint;
}

export interface EntityAccessor<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> {
  createAsync: (value: EntityCreatePayload<TId, TEntity>) => Promise<TEntity>;
  getAsync: (id: TId) => Promise<TEntity>;
  updateAsync: (value: EntityUpdatePayload<TId, TEntity>) => Promise<TEntity>;
  deleteAsync: (id: TId) => Promise<void>;
  getApiEndpointsAsync: () => Promise<IEntityEndpoints>;
}
