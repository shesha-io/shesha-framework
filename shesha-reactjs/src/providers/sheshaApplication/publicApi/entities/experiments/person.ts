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

export interface EntityAccessor<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> {
  createAsync: (value: EntityCreatePayload<TId, TEntity>) => Promise<TEntity>;
  getAsync: (id: TId) => Promise<TEntity>;
  updateAsync: (value: EntityUpdatePayload<TId, TEntity>) => Promise<TEntity>;
  deleteAsync: (id: TId) => Promise<void>;
}

export interface Person extends IEntity<string> {
  // /** Id */
  // id: string;

  /** Creation Time */
  creationTime: Date;
  /** Creator User Id */
  creatorUserId?: number;

  /** Deleter User Id */
  deleterUserId?: number;
  /** Deletion Time */
  deletionTime?: Date;
  /** Is Deleted */
  isDeleted: boolean;

  /** Last Modification Time */
  lastModificationTime?: Date;
  /** Last Modifier User Id */
  lastModifierUserId?: number;

  // ---------------------------
  /** Custom Short Name */
  customShortName: string;
  /** Date Of Birth */
  dateOfBirth?: Date;
  /** Email Address */
  emailAddress1: string;
  /** Alternative Email Address */
  emailAddress2: string;
  /** First Name */
  firstName: string;
  /** Full Name */
  fullName: string;
  /** Home Number */
  homeNumber: string;
  /** Identity Number */
  identityNumber: string;
  /** Initials */
  initials: string;
  /** Last Name */
  lastName: string;
  /** Middle Name */
  middleName: string;
  /** Mobile Number */
  mobileNumber1: string;
  /** Alternate Mobile Number */
  mobileNumber2: string;
  /** Tenant Id */
  tenantId?: number;
  /** Targeting Flag */
  targetingFlag?: number;
}
