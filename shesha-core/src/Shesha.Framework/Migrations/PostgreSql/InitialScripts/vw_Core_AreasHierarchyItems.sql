CREATE OR REPLACE VIEW public."vw_Core_AreasHierarchyItems"
 AS
 WITH RECURSIVE x AS (
         SELECT eu."Id" AS id,
            eu."Name" AS name,
            eu."ParentAreaId" AS parentareaid,
            1 AS level,
            eu."AreaTypeLkp" AS areatypelkp
           FROM "Core_Areas" eu
          WHERE eu."ParentAreaId" IS NULL AND eu."IsDeleted" = false AND eu."Frwk_Discriminator"::text = 'Core.Area'::text
        UNION ALL
         SELECT eu."Id" AS id,
            eu."Name" AS name,
            eu."ParentAreaId" AS parentareaid,
            x.level + 1 AS level,
            eu."AreaTypeLkp" AS areatypelkp
           FROM x
             JOIN "Core_Areas" eu ON eu."ParentAreaId" = x.id AND eu."IsDeleted" = false
        ), x2 AS (
         SELECT x.id,
            x.id AS ancestorid,
            x.name,
            x.level,
            x.areatypelkp
           FROM x
        UNION ALL
         SELECT eu.id,
            x2.ancestorid,
            eu.name,
            x2.level,
            eu.areatypelkp
           FROM x2
             JOIN x eu ON eu.parentareaid = x2.id
        ), x3 AS (
         SELECT x2.id,
            x2.ancestorid,
            x2.name,
            x2.level,
            x2.areatypelkp
           FROM x2
          WHERE x2.id <> x2.ancestorid OR (EXISTS ( SELECT 1
                   FROM "Core_Areas"
                  WHERE "Core_Areas"."Id" = x2.id AND "Core_Areas"."ParentAreaId" IS NULL))
        )
 SELECT concat(x3.id::character varying(40), '_', x3.ancestorid::character varying(40)) AS "Id",
    x3.id AS "AreaId",
    x3.ancestorid AS "AncestorId",
    x3.name AS "Name",
    x3.level AS "Level",
    x3.areatypelkp AS "AreaTypeLkp"
   FROM x3;
