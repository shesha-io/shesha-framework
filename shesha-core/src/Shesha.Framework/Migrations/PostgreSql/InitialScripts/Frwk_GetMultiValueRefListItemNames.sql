CREATE OR REPLACE FUNCTION public."Frwk_GetMultiValueRefListItemNames"(
	"RefListNamespace" character varying,
	"RefListName" character varying,
	"RefListItemValue" bigint)
    RETURNS character varying
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
declare
    /************************************************************************************************
    ******  TRANSLATES A MULTI-VALUE/BIT MAP REFERENCE LIST VALUE INTO A LIST OF TRANSLATED NAMES ***
    ************************************************************************************************/
    "RetVal"                 varchar(255);
	"ConcatenatedList"       varchar(255) = '';
	"referenceListId"        uuid;
	"NullValueName"          varchar(255) = null;    -- The value to return if the item is NULL 
	"Separator"              varchar(20) = null;     -- The characters to place in between each entry
begin 
	"Separator" := ', ';
	"NullValueName" := '';
	"referenceListId" := ( SELECT  list."Id" 
							FROM
								"Frwk_ReferenceListItems" item
								inner join "Frwk_ReferenceLists" list on list."Id" = item."ReferenceListId"
								inner join "Frwk_ConfigurationItems" ci on ci."Id" = list."Id"
							WHERE
								"ItemValue" = "RefListItemValue"
								and ci."VersionStatusLkp" = 3 /*Live*/
								and ci."Name" = CONCAT(coalesce(CONCAT("RefListNamespace" , '.'), '') , "RefListName"));
								
    IF ("RefListItemValue" IS NULL) THEN
        "RetVal" := '';
    ELSE
        "ConcatenatedList" := ( 
			SELECT 
				CONCAT(COALESCE(CONCAT("ConcatenatedList" , "Separator"), '') , "Item")
            FROM 
                "Frwk_ReferenceListItems"
            WHERE
                "Frwk_ReferenceListItems"."ReferenceListId" = "referenceListId"
            AND ("ItemValue" & "RefListItemValue") > 0);  
            
        "RetVal" := substring("ConcatenatedList", LENGTH("Separator") + 1, LENGTH("ConcatenatedList"));
	end if;
   return "RetVal";
   
end 
$BODY$;
