CREATE OR REPLACE VIEW public."vw_Core_AreasTreeItem"
 AS
 SELECT a."Id",
    a."ParentAreaId" AS "ParentId",
    a."Name",
    a."TenantId",
    COALESCE(( SELECT 1
           FROM "Core_Areas" childa
          WHERE childa."ParentAreaId" = a."Id" AND childa."IsDeleted" = false
         LIMIT 1), 0)::bit(1) AS "HasChilds"
   FROM "Core_Areas" a
  WHERE a."IsDeleted" = false;
