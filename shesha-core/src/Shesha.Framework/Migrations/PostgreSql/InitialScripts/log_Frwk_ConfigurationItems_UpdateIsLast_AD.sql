CREATE OR REPLACE FUNCTION public."log_Frwk_ConfigurationItems_UpdateIsLast_AD"()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
declare
    v_cnt numeric;
BEGIN
    
    v_cnt := 0;
	
	IF EXISTS (SELECT 1 FROM deleted WHERE "IsLast" = true) THEN
		UPDATE "Frwk_ConfigurationItems" item
		SET "IsLast" = true 
		FROM deleted  
		where item."IsLast" = false
			AND (deleted."ModuleId" = item."ModuleId" OR (deleted."ModuleId" IS NULL AND item."ModuleId" IS NULL))
			AND deleted."Name" = item."Name"
			AND deleted."ItemType" = item."ItemType"
			AND item."Id" = (
				select "Id"
				from "Frwk_ConfigurationItems" lastVersions
				where lastVersions."IsDeleted" = false
					and (lastVersions."ModuleId" = item."ModuleId" or lastVersions."ModuleId" is null and item."ModuleId" is null)
					and lastVersions."Name" = item."Name"
					and lastVersions."ItemType" = item."ItemType"
				order by lastVersions."VersionNo" desc 
				limit 1
			);
			
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
	END IF;

	RETURN NEW;
END;
$BODY$;
