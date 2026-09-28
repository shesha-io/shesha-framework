import { badRequest } from '../../abp/ajaxResponse';
import { entityAuditRepo } from '../../db/repositories';
import { parseQueryOptions, Row } from '../entityStore';
import { pagedResult } from '../../utils/dto';
import { BehaviourHandler } from './types';

/**
 * The audit trail.
 *
 * `EntityHistoryAppService.GetAuditTrailAsync` returns `PagedResultDto<EntityHistoryItemDto>`.
 * The gateway's CRUD engine writes an `entity_audit` row for every create/update/delete, so the
 * trail is a projection of that table — no separate change-tracking machinery is needed, and any
 * entity (including one added in the Entity Designer) gets a history for free.
 */

/** `EntityHistoryItemType`: Created = 0, Updated = 1, Deleted = 2, Added = 3, Removed = 4, Event = 5. */
const HISTORY_ITEM_TYPE: Record<string, number> = {
  Created: 0,
  Updated: 1,
  Deleted: 2,
  Added: 3,
  Removed: 4,
  Event: 5,
};

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

const toInt = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * `entityTypeId` arrives either as `?entityTypeId[name]=X` (Express nests it into an object) or as
 * a bare `?entityTypeId=X`. `EntityTypeIdInput` is `{ module, name, entityType }`.
 */
const readEntityTypeId = (raw: unknown): { module: string; name: string } => {
  if (raw && typeof raw === 'object') {
    const value = raw as Record<string, unknown>;
    return {
      module: str(value.module),
      name: str(value.name) || str(value.entityType),
    };
  }
  return { module: '', name: str(raw) };
};

/** Last dot-segment, so `Shesha.Domain.FrontEndApp` matches the stored `FrontEndApp`. */
const shortName = (value: string): string => {
  const trimmed = str(value);
  return trimmed.slice(trimmed.lastIndexOf('.') + 1).toLowerCase();
};

/** GET /api/services/app/EntityHistory/GetAuditTrail */
export const getAuditTrail: BehaviourHandler = (ctx) => {
  const entityId = str(ctx.query.entityId ?? ctx.body.entityId);
  const entityTypeId = readEntityTypeId(ctx.query.entityTypeId ?? ctx.body.entityTypeId);
  const legacyName = str(ctx.query.entityTypeFullName ?? ctx.body.entityTypeFullName);
  const wanted = entityTypeId.name || legacyName;

  if (!wanted) {
    // shesha-core throws ArgumentNullException here; the trail is meaningless without a type.
    throw badRequest('`entityType` or `name` or `entityTypeFullName` should not be null');
  }

  const needle = shortName(wanted);
  const options = parseQueryOptions(ctx);

  let rows = entityAuditRepo
    .forEntity(entityId)
    .filter((row) => shortName(row.entityName) === needle)
    .map(
      (row): Row => ({
        id: String(row.id),
        creationTime: row.creationTime,
        historyItemType: HISTORY_ITEM_TYPE[row.eventType] ?? HISTORY_ITEM_TYPE.Event,
        entityId: row.entityId,
        entityTypeFullName: row.entityModule ? `${row.entityModule}.${row.entityName}` : row.entityName,
        eventType: row.eventType,
        userFullName: row.userFullName,
        impersonatorUserFullName: null,
        eventText: row.eventText ?? row.eventType,
        extendedDescription: row.extendedDescription,
      }),
    );

  if (options.quickSearch) {
    const term = options.quickSearch.toLowerCase();
    rows = rows.filter((row) =>
      [row.eventText, row.userFullName, row.extendedDescription, row.eventType].some((value) =>
        str(value).toLowerCase().includes(term),
      ),
    );
  }

  const totalCount = rows.length;
  const skip = toInt(options.skipCount, 0);
  if (skip > 0) rows = rows.slice(skip);
  const max = options.maxResultCount;
  if (max !== undefined && max >= 0) rows = rows.slice(0, max);

  return pagedResult(rows, totalCount);
};

