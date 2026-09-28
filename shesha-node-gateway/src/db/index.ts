import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const resolveDbPath = (p: string): string => {
  if (p === ':memory:') return p;
  const full = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  return full;
};

export const db = new Database(resolveDbPath(config.db.path));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** Idempotent schema creation. */
export const migrate = (): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      userName      TEXT NOT NULL UNIQUE,
      email         TEXT,
      firstName     TEXT,
      lastName      TEXT,
      passwordHash  TEXT NOT NULL,
      personId      TEXT,
      tenantId      INTEGER,
      isActive      INTEGER NOT NULL DEFAULT 1,
      permissions   TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS settings (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT NOT NULL,
      module   TEXT NOT NULL DEFAULT '',
      appKey   TEXT NOT NULL DEFAULT '',
      dataType TEXT,
      value    TEXT,
      UNIQUE(name, module, appKey)
    );

    CREATE TABLE IF NOT EXISTS modules (
      name        TEXT PRIMARY KEY,
      accessor    TEXT,
      description TEXT,
      isEditable  INTEGER NOT NULL DEFAULT 0
    );

    -- Generic configuration items (ReferenceList, Form, ...). Mirrors Shesha's
    -- ConfigurationItem abstraction so one table serves every config-driven call.
    CREATE TABLE IF NOT EXISTS config_items (
      itemType    TEXT NOT NULL,
      module      TEXT NOT NULL DEFAULT '',
      name        TEXT NOT NULL,
      label       TEXT,
      description TEXT,
      json        TEXT NOT NULL,
      md5         TEXT,
      PRIMARY KEY (itemType, module, name)
    );

    CREATE TABLE IF NOT EXISTS metadata (
      id         TEXT PRIMARY KEY,
      entityType TEXT NOT NULL,
      module     TEXT,
      json       TEXT NOT NULL,
      md5        TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_metadata_entity ON metadata(entityType, module);

    -- Configuration Studio tree: folders and per-item tree metadata. Forms keep their
    -- markup on disk (config/forms) and other items keep content in config_items; this
    -- table only adds what the tree needs (folder placement, flags, labels) plus the
    -- index entry for items created inside the studio.
    CREATE TABLE IF NOT EXISTS config_nodes (
      id                   TEXT PRIMARY KEY,
      nodeKind             TEXT NOT NULL,
      itemType             TEXT NOT NULL DEFAULT '',
      discriminator        TEXT NOT NULL DEFAULT '',
      module               TEXT NOT NULL DEFAULT '',
      name                 TEXT NOT NULL DEFAULT '',
      label                TEXT,
      description          TEXT,
      folderId             TEXT,
      applicationId        TEXT,
      isCodeBased          INTEGER NOT NULL DEFAULT 0,
      isExposed            INTEGER NOT NULL DEFAULT 0,
      creationTime         TEXT,
      lastModificationTime TEXT,
      lastModifierUser     TEXT,
      UNIQUE(nodeKind, module, itemType, name)
    );
    CREATE INDEX IF NOT EXISTS idx_config_nodes_folder ON config_nodes(folderId);

    -- Configuration item history, backing ConfigurationStudio/GetItemRevisions.
    CREATE TABLE IF NOT EXISTS config_item_revisions (
      id              TEXT PRIMARY KEY,
      itemId          TEXT NOT NULL,
      moduleName      TEXT NOT NULL DEFAULT '',
      versionNo       INTEGER NOT NULL,
      versionName     TEXT,
      comments        TEXT,
      configHash      TEXT,
      json            TEXT NOT NULL,
      isCompressed    INTEGER NOT NULL DEFAULT 0,
      creationMethod  INTEGER NOT NULL DEFAULT 0,
      creationTime    TEXT,
      creatorUserId   TEXT,
      creatorUserName TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_revisions_item ON config_item_revisions(itemId, versionNo DESC);

    -- Generic row store for EVERY entity served through the dynamic CRUD API
    -- (/api/dynamic/{module}/{entity}/Crud/{action}) and the resource registry
    -- (/api/services/app/{Service}/{Action}). shesha-core gives each entity its own
    -- table via codegen; the gateway keeps one table with the row as JSON so that an
    -- entity created in the Entity Designer works immediately with no schema change.
    -- Soft delete mirrors ABP's ISoftDelete, which the frontend relies on.
    CREATE TABLE IF NOT EXISTS entity_rows (
      id                 TEXT NOT NULL,
      module             TEXT NOT NULL DEFAULT '',
      entityName         TEXT NOT NULL,
      json               TEXT NOT NULL,
      isDeleted          INTEGER NOT NULL DEFAULT 0,
      creationTime       TEXT,
      creatorUserId      TEXT,
      lastModificationTime TEXT,
      lastModifierUserId TEXT,
      PRIMARY KEY (module, entityName, id)
    );
    CREATE INDEX IF NOT EXISTS idx_entity_rows_lookup ON entity_rows(module, entityName, isDeleted);

    -- Change log written by the CRUD engine; backs EntityHistory/GetAuditTrail.
    CREATE TABLE IF NOT EXISTS entity_audit (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      entityId          TEXT NOT NULL,
      entityModule      TEXT NOT NULL DEFAULT '',
      entityName        TEXT NOT NULL,
      eventType         TEXT NOT NULL,
      eventText         TEXT,
      extendedDescription TEXT,
      userFullName      TEXT,
      creationTime      TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_entity_audit_entity ON entity_audit(entityId, entityName);

    -- One-time pins for Otp/SendPin + Otp/VerifyPin and the password-reset flows.
    CREATE TABLE IF NOT EXISTS otp_operations (
      operationId   TEXT PRIMARY KEY,
      sendTo        TEXT NOT NULL,
      sendType      TEXT,
      recipientType TEXT,
      recipientId   TEXT,
      actionType    TEXT,
      pinHash       TEXT NOT NULL,
      username      TEXT,
      expiresAt     TEXT NOT NULL,
      isVerified    INTEGER NOT NULL DEFAULT 0,
      attempts      INTEGER NOT NULL DEFAULT 0,
      creationTime  TEXT
    );

    -- Setting metadata backing the frontend's typed application.settings API.
    -- The client resolves module.accessor -> category.accessor -> setting.accessor,
    -- then reads the value via Settings/GetValue?module=<moduleName>&name=<name>.
    CREATE TABLE IF NOT EXISTS setting_configurations (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      moduleAccessor   TEXT NOT NULL,
      moduleName       TEXT NOT NULL,
      categoryAccessor TEXT NOT NULL,
      categoryName     TEXT NOT NULL,
      accessor         TEXT NOT NULL,
      name             TEXT NOT NULL,
      description      TEXT,
      dataType         TEXT NOT NULL DEFAULT 'object',
      dataFormat       TEXT,
      UNIQUE(moduleAccessor, categoryAccessor, accessor)
    );
  `);
};
