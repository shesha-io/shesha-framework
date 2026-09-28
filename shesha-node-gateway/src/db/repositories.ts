import { db } from './index';

export interface UserRow {
  id: number;
  userName: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  passwordHash: string;
  personId: string | null;
  tenantId: number | null;
  isActive: number;
  permissions: string;
}

export interface SettingRow {
  name: string;
  module: string;
  appKey: string;
  dataType: string | null;
  value: string | null;
}

export interface ModuleRow {
  name: string;
  accessor: string | null;
  description: string | null;
  isEditable: number;
}

export interface ConfigItemRow {
  itemType: string;
  module: string;
  name: string;
  label: string | null;
  description: string | null;
  json: string;
  md5: string | null;
}

export interface MetadataRow {
  id: string;
  entityType: string;
  module: string | null;
  json: string;
  md5: string | null;
}

const parsePermissions = (raw: string): string[] => {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch {
    return [];
  }
};

export const usersRepo = {
  findByLogin(login: string): UserRow | undefined {
    return db
      .prepare('SELECT * FROM users WHERE (userName = ? OR email = ?) LIMIT 1')
      .get(login, login) as UserRow | undefined;
  },
  findById(id: number): UserRow | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  },
  permissionsOf(user: UserRow): string[] {
    return parsePermissions(user.permissions);
  },
  upsert(input: {
    userName: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    passwordHash: string;
    personId?: string | null;
    tenantId?: number | null;
    permissions?: string[];
  }): void {
    db.prepare(
      `INSERT INTO users (userName, email, firstName, lastName, passwordHash, personId, tenantId, isActive, permissions)
       VALUES (@userName, @email, @firstName, @lastName, @passwordHash, @personId, @tenantId, 1, @permissions)
       ON CONFLICT(userName) DO UPDATE SET
         email = excluded.email,
         firstName = excluded.firstName,
         lastName = excluded.lastName,
         passwordHash = excluded.passwordHash,
         personId = excluded.personId,
         permissions = excluded.permissions`,
    ).run({
      userName: input.userName,
      email: input.email ?? null,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      passwordHash: input.passwordHash,
      personId: input.personId ?? null,
      tenantId: input.tenantId ?? null,
      permissions: JSON.stringify(input.permissions ?? []),
    });
  },
  all(): UserRow[] {
    return db.prepare('SELECT * FROM users ORDER BY id').all() as UserRow[];
  },
  setPasswordHash(id: number, passwordHash: string): void {
    db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(passwordHash, id);
  },
  setActive(id: number, isActive: boolean): void {
    db.prepare('UPDATE users SET isActive = ? WHERE id = ?').run(isActive ? 1 : 0, id);
  },
  setPermissions(id: number, permissions: string[]): void {
    db.prepare('UPDATE users SET permissions = ? WHERE id = ?').run(JSON.stringify(permissions), id);
  },
  /** Row id for a user, or undefined — used by the audit trail's `creatorUserId`. */
  nextId(): number {
    const row = db.prepare('SELECT MAX(id) AS maxId FROM users').get() as { maxId: number | null };
    return (row?.maxId ?? 0) + 1;
  },
};

export const settingsRepo = {
  get(name: string, module = '', appKey = ''): SettingRow | undefined {
    return db
      .prepare('SELECT name, module, appKey, dataType, value FROM settings WHERE name = ? AND module = ? AND appKey = ?')
      .get(name, module, appKey) as SettingRow | undefined;
  },
  set(name: string, module: string, appKey: string, value: unknown, dataType?: string | null): void {
    db.prepare(
      `INSERT INTO settings (name, module, appKey, dataType, value)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(name, module, appKey) DO UPDATE SET value = excluded.value, dataType = COALESCE(excluded.dataType, settings.dataType)`,
    ).run(name, module, appKey, dataType ?? null, value === undefined ? null : JSON.stringify(value));
  },
  parseValue(row: SettingRow | undefined): unknown {
    if (!row || row.value === null) return null;
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  },
};

export const modulesRepo = {
  all(): ModuleRow[] {
    return db.prepare('SELECT * FROM modules ORDER BY name').all() as ModuleRow[];
  },
  get(name: string): ModuleRow | undefined {
    return db.prepare('SELECT * FROM modules WHERE name = ?').get(name) as ModuleRow | undefined;
  },
  upsert(m: { name: string; accessor?: string | null; description?: string | null; isEditable?: boolean }): void {
    db.prepare(
      `INSERT INTO modules (name, accessor, description, isEditable)
       VALUES (@name, @accessor, @description, @isEditable)
       ON CONFLICT(name) DO UPDATE SET accessor = excluded.accessor, description = excluded.description, isEditable = excluded.isEditable`,
    ).run({
      name: m.name,
      accessor: m.accessor ?? null,
      description: m.description ?? null,
      isEditable: m.isEditable ? 1 : 0,
    });
  },
};

export const configItemsRepo = {
  all(): ConfigItemRow[] {
    return db.prepare('SELECT * FROM config_items ORDER BY itemType, module, name').all() as ConfigItemRow[];
  },
  get(itemType: string, module: string, name: string): ConfigItemRow | undefined {
    return db
      .prepare('SELECT * FROM config_items WHERE itemType = ? AND module = ? AND name = ?')
      .get(itemType, module, name) as ConfigItemRow | undefined;
  },
  delete(itemType: string, module: string, name: string): void {
    db.prepare('DELETE FROM config_items WHERE itemType = ? AND module = ? AND name = ?').run(itemType, module, name);
  },
  upsert(item: {
    itemType: string;
    module: string;
    name: string;
    label?: string | null;
    description?: string | null;
    json: unknown;
    md5?: string | null;
  }): void {
    db.prepare(
      `INSERT INTO config_items (itemType, module, name, label, description, json, md5)
       VALUES (@itemType, @module, @name, @label, @description, @json, @md5)
       ON CONFLICT(itemType, module, name) DO UPDATE SET
         label = excluded.label, description = excluded.description, json = excluded.json, md5 = excluded.md5`,
    ).run({
      itemType: item.itemType,
      module: item.module,
      name: item.name,
      label: item.label ?? null,
      description: item.description ?? null,
      json: JSON.stringify(item.json),
      md5: item.md5 ?? null,
    });
  },
};

export const metadataRepo = {
  all(): MetadataRow[] {
    return db.prepare('SELECT * FROM metadata ORDER BY entityType').all() as MetadataRow[];
  },
  get(id: string): MetadataRow | undefined {
    return db.prepare('SELECT * FROM metadata WHERE id = ?').get(id) as MetadataRow | undefined;
  },
  getByEntityType(entityType: string, module?: string | null): MetadataRow | undefined {
    if (module) {
      const row = db
        .prepare('SELECT * FROM metadata WHERE entityType = ? AND module = ? LIMIT 1')
        .get(entityType, module) as MetadataRow | undefined;
      if (row) return row;
    }
    return db
      .prepare('SELECT * FROM metadata WHERE entityType = ? LIMIT 1')
      .get(entityType) as MetadataRow | undefined;
  },
  upsert(m: { id: string; entityType: string; module?: string | null; json: unknown; md5?: string | null }): void {
    db.prepare(
      `INSERT INTO metadata (id, entityType, module, json, md5)
       VALUES (@id, @entityType, @module, @json, @md5)
       ON CONFLICT(id) DO UPDATE SET entityType = excluded.entityType, module = excluded.module, json = excluded.json, md5 = excluded.md5`,
    ).run({
      id: m.id,
      entityType: m.entityType,
      module: m.module ?? null,
      json: JSON.stringify(m.json),
      md5: m.md5 ?? null,
    });
  },
};

/** Shaped exactly like the frontend's SettingConfigurationDto (settings/models.ts). */
export interface SettingConfigurationSeed {
  name: string;
  description?: string;
  accessor: string;
  dataType: { dataType: string; dataFormat?: string };
  module: { name: string; accessor: string };
  category: { name: string; accessor: string };
}

export const settingConfigurationsRepo = {
  all(): SettingConfigurationSeed[] {
    const rows = db
      .prepare('SELECT * FROM setting_configurations ORDER BY id')
      .all() as Record<string, string | null>[];
    return rows.map((r) => ({
      name: r.name ?? '',
      description: r.description ?? undefined,
      accessor: r.accessor ?? '',
      dataType: {
        dataType: r.dataType ?? 'object',
        ...(r.dataFormat ? { dataFormat: r.dataFormat } : {}),
      },
      module: { name: r.moduleName ?? '', accessor: r.moduleAccessor ?? '' },
      category: { name: r.categoryName ?? '', accessor: r.categoryAccessor ?? '' },
    }));
  },

  upsert(seed: SettingConfigurationSeed): void {
    db.prepare(
      `INSERT INTO setting_configurations
         (moduleAccessor, moduleName, categoryAccessor, categoryName, accessor, name, description, dataType, dataFormat)
       VALUES
         (@moduleAccessor, @moduleName, @categoryAccessor, @categoryName, @accessor, @name, @description, @dataType, @dataFormat)
       ON CONFLICT(moduleAccessor, categoryAccessor, accessor) DO UPDATE SET
         moduleName = excluded.moduleName,
         categoryName = excluded.categoryName,
         name = excluded.name,
         description = excluded.description,
         dataType = excluded.dataType,
         dataFormat = excluded.dataFormat`,
    ).run({
      moduleAccessor: seed.module.accessor,
      moduleName: seed.module.name,
      categoryAccessor: seed.category.accessor,
      categoryName: seed.category.name,
      accessor: seed.accessor,
      name: seed.name,
      description: seed.description ?? null,
      dataType: seed.dataType.dataType,
      dataFormat: seed.dataType.dataFormat ?? null,
    });
  },
};

/** Configuration Studio tree node (folder or item). */
export interface ConfigNodeRow {
  id: string;
  nodeKind: 'folder' | 'item';
  itemType: string;
  discriminator: string;
  module: string;
  name: string;
  label: string | null;
  description: string | null;
  folderId: string | null;
  applicationId: string | null;
  isCodeBased: number;
  isExposed: number;
  creationTime: string | null;
  lastModificationTime: string | null;
  lastModifierUser: string | null;
}

export interface ConfigNodeInput {
  id: string;
  nodeKind: 'folder' | 'item';
  itemType?: string | null;
  discriminator?: string | null;
  module: string;
  name: string;
  label?: string | null;
  description?: string | null;
  folderId?: string | null;
  applicationId?: string | null;
  isCodeBased?: boolean;
  isExposed?: boolean;
  lastModifierUser?: string | null;
}

/**
 * Folders and item tree metadata for Configuration Studio. Item *content* lives elsewhere
 * (forms on disk, everything else in `config_items`); a node row is what places an item in
 * a folder and records its studio-visible flags.
 */
export const configNodesRepo = {
  all(): ConfigNodeRow[] {
    return db.prepare('SELECT * FROM config_nodes ORDER BY module, nodeKind, name').all() as ConfigNodeRow[];
  },
  folders(): ConfigNodeRow[] {
    return db.prepare("SELECT * FROM config_nodes WHERE nodeKind = 'folder' ORDER BY module, name").all() as ConfigNodeRow[];
  },
  items(): ConfigNodeRow[] {
    return db.prepare("SELECT * FROM config_nodes WHERE nodeKind = 'item' ORDER BY module, name").all() as ConfigNodeRow[];
  },
  get(id: string): ConfigNodeRow | undefined {
    return db.prepare('SELECT * FROM config_nodes WHERE id = ?').get(id) as ConfigNodeRow | undefined;
  },
  children(folderId: string): ConfigNodeRow[] {
    return db.prepare('SELECT * FROM config_nodes WHERE folderId = ?').all(folderId) as ConfigNodeRow[];
  },
  upsert(node: ConfigNodeInput): void {
    db.prepare(
      `INSERT INTO config_nodes
         (id, nodeKind, itemType, discriminator, module, name, label, description, folderId, applicationId,
          isCodeBased, isExposed, creationTime, lastModificationTime, lastModifierUser)
       VALUES
         (@id, @nodeKind, @itemType, @discriminator, @module, @name, @label, @description, @folderId, @applicationId,
          @isCodeBased, @isExposed, @creationTime, @lastModificationTime, @lastModifierUser)
       ON CONFLICT(id) DO UPDATE SET
         label = excluded.label,
         description = excluded.description,
         folderId = excluded.folderId,
         applicationId = excluded.applicationId,
         isCodeBased = excluded.isCodeBased,
         isExposed = excluded.isExposed,
         lastModificationTime = excluded.lastModificationTime,
         lastModifierUser = excluded.lastModifierUser`,
    ).run({
      id: node.id,
      nodeKind: node.nodeKind,
      itemType: node.itemType ?? '',
      discriminator: node.discriminator ?? node.itemType ?? '',
      module: node.module,
      name: node.name,
      label: node.label ?? null,
      description: node.description ?? null,
      folderId: node.folderId ?? null,
      applicationId: node.applicationId ?? null,
      isCodeBased: node.isCodeBased ? 1 : 0,
      isExposed: node.isExposed ? 1 : 0,
      creationTime: new Date().toISOString(),
      lastModificationTime: new Date().toISOString(),
      lastModifierUser: node.lastModifierUser ?? null,
    });
  },
  move(id: string, folderId: string | null, lastModifierUser?: string | null): void {
    db.prepare(
      'UPDATE config_nodes SET folderId = ?, lastModificationTime = ?, lastModifierUser = COALESCE(?, lastModifierUser) WHERE id = ?',
    ).run(folderId, new Date().toISOString(), lastModifierUser ?? null, id);
  },
  rename(id: string, name: string, label: string | null, lastModifierUser?: string | null): void {
    db.prepare(
      'UPDATE config_nodes SET name = ?, label = COALESCE(?, label), lastModificationTime = ?, lastModifierUser = COALESCE(?, lastModifierUser) WHERE id = ?',
    ).run(name, label, new Date().toISOString(), lastModifierUser ?? null, id);
  },
  delete(id: string): void {
    db.prepare('DELETE FROM config_nodes WHERE id = ?').run(id);
  },
};

export interface RevisionRow {
  id: string;
  itemId: string;
  moduleName: string;
  versionNo: number;
  versionName: string | null;
  comments: string | null;
  configHash: string | null;
  json: string;
  isCompressed: number;
  creationMethod: number;
  creationTime: string | null;
  creatorUserId: string | null;
  creatorUserName: string | null;
}

export const itemRevisionsRepo = {
  forItem(itemId: string): RevisionRow[] {
    return db
      .prepare('SELECT * FROM config_item_revisions WHERE itemId = ? ORDER BY versionNo DESC')
      .all(itemId) as RevisionRow[];
  },
  get(id: string): RevisionRow | undefined {
    return db.prepare('SELECT * FROM config_item_revisions WHERE id = ?').get(id) as RevisionRow | undefined;
  },
  nextVersionNo(itemId: string): number {
    const row = db
      .prepare('SELECT MAX(versionNo) AS maxVersion FROM config_item_revisions WHERE itemId = ?')
      .get(itemId) as { maxVersion: number | null };
    return (row?.maxVersion ?? 0) + 1;
  },
  add(revision: {
    id: string;
    itemId: string;
    moduleName?: string | null;
    versionName?: string | null;
    comments?: string | null;
    configHash?: string | null;
    json: unknown;
    creationMethod?: number;
    creatorUserId?: string | null;
    creatorUserName?: string | null;
  }): RevisionRow {
    const versionNo = itemRevisionsRepo.nextVersionNo(revision.itemId);
    db.prepare(
      `INSERT INTO config_item_revisions
         (id, itemId, moduleName, versionNo, versionName, comments, configHash, json, isCompressed,
          creationMethod, creationTime, creatorUserId, creatorUserName)
       VALUES
         (@id, @itemId, @moduleName, @versionNo, @versionName, @comments, @configHash, @json, 0,
          @creationMethod, @creationTime, @creatorUserId, @creatorUserName)`,
    ).run({
      id: revision.id,
      itemId: revision.itemId,
      moduleName: revision.moduleName ?? '',
      versionNo,
      versionName: revision.versionName ?? null,
      comments: revision.comments ?? null,
      configHash: revision.configHash ?? null,
      json: typeof revision.json === 'string' ? revision.json : JSON.stringify(revision.json),
      creationMethod: revision.creationMethod ?? 0,
      creationTime: new Date().toISOString(),
      creatorUserId: revision.creatorUserId ?? null,
      creatorUserName: revision.creatorUserName ?? null,
    });
    return itemRevisionsRepo.get(revision.id) as RevisionRow;
  },
  rename(revisionId: string, versionName: string): void {
    db.prepare('UPDATE config_item_revisions SET versionName = ? WHERE id = ?').run(versionName, revisionId);
  },
  deleteForItem(itemId: string): void {
    db.prepare('DELETE FROM config_item_revisions WHERE itemId = ?').run(itemId);
  },
};

export interface EntityRow {
  id: string;
  module: string;
  entityName: string;
  json: string;
  isDeleted: number;
  creationTime: string | null;
  creatorUserId: string | null;
  lastModificationTime: string | null;
  lastModifierUserId: string | null;
}

export interface AuditRow {
  id: number;
  entityId: string;
  entityModule: string;
  entityName: string;
  eventType: string;
  eventText: string | null;
  extendedDescription: string | null;
  userFullName: string | null;
  creationTime: string | null;
}

/**
 * The single generic row store behind both the dynamic CRUD API and the resource registry.
 * Rows are opaque JSON, so adding an entity never touches the schema — which is what lets an
 * entity created in the Entity Designer be queryable immediately.
 */
export const entityRowsRepo = {
  get(module: string, entityName: string, id: string): EntityRow | undefined {
    return db
      .prepare('SELECT * FROM entity_rows WHERE module = ? AND entityName = ? AND id = ? AND isDeleted = 0')
      .get(module, entityName, String(id)) as EntityRow | undefined;
  },
  all(module: string, entityName: string): EntityRow[] {
    return db
      .prepare('SELECT * FROM entity_rows WHERE module = ? AND entityName = ? AND isDeleted = 0')
      .all(module, entityName) as EntityRow[];
  },
  insert(input: {
    id: string;
    module: string;
    entityName: string;
    json: unknown;
    creatorUserId?: string | null;
  }): void {
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO entity_rows (id, module, entityName, json, isDeleted, creationTime, creatorUserId)
       VALUES (@id, @module, @entityName, @json, 0, @creationTime, @creatorUserId)`,
    ).run({
      id: String(input.id),
      module: input.module,
      entityName: input.entityName,
      json: JSON.stringify(input.json),
      creationTime: now,
      creatorUserId: input.creatorUserId ?? null,
    });
  },
  update(module: string, entityName: string, id: string, json: unknown, modifierUserId?: string | null): void {
    db.prepare(
      `UPDATE entity_rows SET json = ?, lastModificationTime = ?, lastModifierUserId = ?
        WHERE module = ? AND entityName = ? AND id = ?`,
    ).run(JSON.stringify(json), new Date().toISOString(), modifierUserId ?? null, module, entityName, String(id));
  },
  /** ABP `ISoftDelete` — the row stays, filtered out of every read. */
  softDelete(module: string, entityName: string, id: string): boolean {
    const info = db
      .prepare('UPDATE entity_rows SET isDeleted = 1, lastModificationTime = ? WHERE module = ? AND entityName = ? AND id = ? AND isDeleted = 0')
      .run(new Date().toISOString(), module, entityName, String(id));
    return info.changes > 0;
  },
  /**
   * Idempotent write for seeded rows: inserts, or overwrites *and un-deletes* an existing row.
   *
   * `get` filters soft-deleted rows out, so the seed cannot use it to choose between insert and
   * update — a row a user deleted would collide on the primary key instead of coming back on the
   * next boot.
   */
  put(module: string, entityName: string, id: string, json: unknown): void {
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO entity_rows (id, module, entityName, json, isDeleted, creationTime)
       VALUES (@id, @module, @entityName, @json, 0, @creationTime)
       ON CONFLICT (module, entityName, id) DO UPDATE SET
         json = excluded.json, isDeleted = 0, lastModificationTime = @creationTime`,
    ).run({ id: String(id), module, entityName, json: JSON.stringify(json), creationTime: now });
  },
  hardDelete(module: string, entityName: string, id: string): boolean {
    const info = db
      .prepare('DELETE FROM entity_rows WHERE module = ? AND entityName = ? AND id = ?')
      .run(module, entityName, String(id));
    return info.changes > 0;
  },
};

export const entityAuditRepo = {
  add(entry: {
    entityId: string;
    entityModule?: string | null;
    entityName: string;
    eventType: string;
    eventText?: string | null;
    extendedDescription?: string | null;
    userFullName?: string | null;
  }): void {
    db.prepare(
      `INSERT INTO entity_audit (entityId, entityModule, entityName, eventType, eventText, extendedDescription, userFullName, creationTime)
       VALUES (@entityId, @entityModule, @entityName, @eventType, @eventText, @extendedDescription, @userFullName, @creationTime)`,
    ).run({
      entityId: String(entry.entityId),
      entityModule: entry.entityModule ?? '',
      entityName: entry.entityName,
      eventType: entry.eventType,
      eventText: entry.eventText ?? null,
      extendedDescription: entry.extendedDescription ?? null,
      userFullName: entry.userFullName ?? null,
      creationTime: new Date().toISOString(),
    });
  },
  forEntity(entityId: string, entityName?: string | null): AuditRow[] {
    return entityName
      ? (db
          .prepare('SELECT * FROM entity_audit WHERE entityId = ? AND entityName = ? ORDER BY id DESC')
          .all(String(entityId), entityName) as AuditRow[])
      : (db.prepare('SELECT * FROM entity_audit WHERE entityId = ? ORDER BY id DESC').all(String(entityId)) as AuditRow[]);
  },
  all(): AuditRow[] {
    return db.prepare('SELECT * FROM entity_audit ORDER BY id DESC').all() as AuditRow[];
  },
};

export interface OtpRow {
  operationId: string;
  sendTo: string;
  sendType: string | null;
  recipientType: string | null;
  recipientId: string | null;
  actionType: string | null;
  pinHash: string;
  username: string | null;
  expiresAt: string;
  isVerified: number;
  attempts: number;
  creationTime: string | null;
}

export const otpRepo = {
  add(input: {
    operationId: string;
    sendTo: string;
    sendType?: string | null;
    recipientType?: string | null;
    recipientId?: string | null;
    actionType?: string | null;
    pinHash: string;
    username?: string | null;
    expiresAt: string;
  }): void {
    db.prepare(
      `INSERT INTO otp_operations
         (operationId, sendTo, sendType, recipientType, recipientId, actionType, pinHash, username, expiresAt, isVerified, attempts, creationTime)
       VALUES
         (@operationId, @sendTo, @sendType, @recipientType, @recipientId, @actionType, @pinHash, @username, @expiresAt, 0, 0, @creationTime)`,
    ).run({ ...input, creationTime: new Date().toISOString() });
  },
  get(operationId: string): OtpRow | undefined {
    return db.prepare('SELECT * FROM otp_operations WHERE operationId = ?').get(operationId) as OtpRow | undefined;
  },
  /**
   * The most recent pin issued for a user. The reset wizard only carries the username between
   * steps (shesha-core keeps the operation id on `User.PasswordResetCode`), so lookups by user
   * are how `Otp/VerifyPin` still resolves the right operation.
   */
  latestByUsername(username: string): OtpRow | undefined {
    if (!username) return undefined;
    return db
      .prepare('SELECT * FROM otp_operations WHERE username = ? ORDER BY creationTime DESC, rowid DESC LIMIT 1')
      .get(username) as OtpRow | undefined;
  },
  markVerified(operationId: string): void {
    db.prepare('UPDATE otp_operations SET isVerified = 1 WHERE operationId = ?').run(operationId);
  },
  recordAttempt(operationId: string): number {
    db.prepare('UPDATE otp_operations SET attempts = attempts + 1 WHERE operationId = ?').run(operationId);
    return otpRepo.get(operationId)?.attempts ?? 0;
  },
  remove(operationId: string): void {
    db.prepare('DELETE FROM otp_operations WHERE operationId = ?').run(operationId);
  },
};
