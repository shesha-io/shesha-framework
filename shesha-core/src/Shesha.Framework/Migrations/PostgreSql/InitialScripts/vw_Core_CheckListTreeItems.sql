CREATE OR REPLACE VIEW public."vw_Core_CheckListTreeItems"
 AS
 SELECT t."Id",
    t."ParentId",
    t."CheckListId",
    t."Name",
    t."TenantId",
    t."OrderIndex",
    t."CreationTime",
    COALESCE(( SELECT 1
           FROM "Core_CheckListItems" childt
          WHERE childt."ParentId" = t."Id" AND childt."IsDeleted" = false
         LIMIT 1), 0)::bit(1) AS "HasChilds"
   FROM "Core_CheckListItems" t
  WHERE t."IsDeleted" = false;
