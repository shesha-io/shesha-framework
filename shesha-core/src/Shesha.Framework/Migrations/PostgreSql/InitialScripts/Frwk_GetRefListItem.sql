CREATE OR REPLACE FUNCTION public."Frwk_GetRefListItem"(
	"RefListNamespace" character varying,
	"RefListName" character varying,
	"RefListItemValue" integer)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
declare
   "RetVal" varchar(255);
begin 
	IF ("RefListItemValue" IS NULL) THEN
        "RetVal" := '';
    ELSE
        "RetVal"  := ( SELECT  "Item"
            FROM
                "Frwk_ReferenceListItems" item
                inner join "Frwk_ReferenceLists" list on list."Id" = item."ReferenceListId"
                inner join "Frwk_ConfigurationItems" ci on ci."Id" = list."Id"
            WHERE
                "ItemValue" = "RefListItemValue"
                and ci."VersionStatusLkp" = 3 /*Live*/
                --and ci."Name" = coalesce("RefListNamespace" + '.', '') + "RefListName");
                and ci."Name" = CONCAT(coalesce(CONCAT("RefListNamespace" , '.'), '') , "RefListName"));
        IF ("RetVal" IS NULL) THEN
            "RetVal" := 'INVALID';
		end if;
	end if;
   return "RetVal";
   
end 
$BODY$;
