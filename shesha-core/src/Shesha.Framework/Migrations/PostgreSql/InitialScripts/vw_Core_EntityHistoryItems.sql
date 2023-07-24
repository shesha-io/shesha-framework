CREATE OR REPLACE VIEW public."vw_Core_EntityHistoryItems"
 AS
 SELECT ec."Id",
    ecs."Id" AS "EntityChangeSetId",
    ecs."CreationTime",
    ec."Id" AS "EntityChangeId",
    ec."ChangeType",
    ec."EntityId",
    ec."EntityTypeFullName",
    pc."PropertyTypeFullName",
    pc."PropertyName",
    pc."OriginalValue",
    pc."NewValue",
    p."Id" AS "PersonId",
    p."FullName" AS "UserFullName",
    ecs."UserId",
    ec."TenantId"
   FROM "AbpEntityChanges" ec
     JOIN "AbpEntityChangeSets" ecs ON ecs."Id" = ec."EntityChangeSetId"
     JOIN "AbpEntityPropertyChanges" pc ON pc."EntityChangeId" = ec."Id"
     LEFT JOIN "Core_Persons" p ON p."UserId" = ecs."UserId";
