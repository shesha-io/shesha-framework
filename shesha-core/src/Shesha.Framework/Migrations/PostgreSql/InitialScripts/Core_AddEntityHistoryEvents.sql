CREATE OR REPLACE PROCEDURE public."Core_AddEntityHistoryEvents"(
	IN "changeTime" timestamp without time zone,
	IN reason text,
	IN "tenantId" integer,
	IN "userId" integer,
	IN changes "Core_EntityHistoryItem"[])
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
  count BIGINT;
  ecsId INT;
BEGIN
 
  SELECT COUNT(*) INTO count FROM unnest(changes) ;

  RAISE NOTICE '%', count;

  IF count > 0 THEN
    "changeTime" := COALESCE("changeTime", CURRENT_TIMESTAMP);

    -- insert EntityChangeSet
    INSERT INTO "AbpEntityChangeSets" ("BrowserInfo", "CreationTime", "Reason", "TenantId", "UserId")
    VALUES ('Direct DB change', "changeTime", "reason", "tenantId", "userId")
    RETURNING "Id" INTO ecsId;

    -- insert into entityChanges table
    CREATE TEMPORARY TABLE entityChanges (
      "ChangeType" SMALLINT,
      "EntityId" VARCHAR(48),
      "EntityTypeFullName" VARCHAR(192)
    );

    INSERT INTO entityChanges ("ChangeType", "EntityId", "EntityTypeFullName")
    SELECT DISTINCT (unnest(changes))."ChangeType", (unnest(changes))."EntityId", (unnest(changes))."EntityTypeFullName";

    -- Insert EntityChanges
    INSERT INTO "AbpEntityChanges" ("ChangeTime", "ChangeType", "EntityChangeSetId", "EntityId", "EntityTypeFullName", "TenantId")
    SELECT "changeTime", COALESCE(ec."ChangeType", 1), ecsId, ec."EntityId", ec."EntityTypeFullName", "tenantId"
    FROM entityChanges ec;

    -- Insert EntityPropertyChanges
    INSERT INTO "AbpEntityPropertyChanges" ("EntityChangeId", "NewValue", "OriginalValue", "PropertyName", "PropertyTypeFullName", "TenantId")
    SELECT
      ec."Id",
      c."NewValue",
      c."OldValue",
      c."PropertyName",
      c."PropertyTypeFullName",
      "tenantId"
    FROM unnest(changes) c
    JOIN "AbpEntityChanges" ec ON ec."EntityChangeSetId" = ecsId
      AND ec."ChangeType" = COALESCE(c."ChangeType", 1)
      AND ec."EntityId" = c."EntityId"
      AND ec."EntityTypeFullName" = c."EntityTypeFullName"
    WHERE TRIM(COALESCE(c."PropertyName", '')) <> '';

    -- Insert Descriptions for EntityPropertyChanges
    INSERT INTO "Core_EntityHistoryEvents" ("Id", "EntityPropertyChangeId", "EventType", "Description")
    SELECT
      UUID_GENERATE_V4(),
      pc."Id",
      'PROPERTY_CHANGE_FRIENDLY_TEXT',
      c."Description"
    FROM unnest(changes) c
    JOIN "AbpEntityChanges" ec ON ec."EntityChangeSetId" = ecsId
      AND ec."ChangeType" = COALESCE(c."ChangeType", 1)
      AND ec."EntityId" = c."EntityId"
      AND ec."EntityTypeFullName" = c."EntityTypeFullName"
    JOIN "AbpEntityPropertyChanges" pc ON pc."EntityChangeId" = ec."Id"
      AND pc."PropertyName" = c."PropertyName"
      AND pc."PropertyTypeFullName" = c."PropertyTypeFullName"
    WHERE TRIM(COALESCE(c."PropertyName", '')) <> ''
      AND TRIM(COALESCE(c."Description", '')) <> '';

    -- Insert Descriptions for EntityChanges
    INSERT INTO "Core_EntityHistoryEvents" ("Id", "EntityChangeId", "EventType", "Description")
    SELECT
      UUID_GENERATE_V4(),
      ec."Id",
      'ENTITY_EVENT',
      c."Description"
    FROM unnest(changes) c
    JOIN "AbpEntityChanges" ec ON ec."EntityChangeSetId" = ecsId
      AND ec."ChangeType" = COALESCE(c."ChangeType", 1)
      AND ec."EntityId" = c."EntityId"
      AND ec."EntityTypeFullName" = c."EntityTypeFullName"
    WHERE c."PropertyName" IS NULL
      AND TRIM(COALESCE(c."Description", '')) <> '';
  END IF;
END;
$BODY$;
