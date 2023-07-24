CREATE OR REPLACE VIEW public."vw_Core_ReferenceListItemvalues"
 AS
 SELECT m."Name" AS "Module",
    ci."Name",
    item."Item",
    item."ItemValue"
   FROM "Frwk_ReferenceLists" list
     JOIN "Frwk_ConfigurationItems" ci ON ci."Id" = list."Id" AND ci."VersionStatusLkp" = 3
     LEFT JOIN "Frwk_Modules" m ON m."Id" = ci."ModuleId"
     JOIN "Frwk_ReferenceListItems" item ON item."ReferenceListId" = list."Id" AND item."IsDeleted" = false
  WHERE ci."IsDeleted" = false;
