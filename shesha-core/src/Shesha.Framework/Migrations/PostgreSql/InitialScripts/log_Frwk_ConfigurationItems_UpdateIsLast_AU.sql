CREATE OR REPLACE FUNCTION public."log_Frwk_ConfigurationItems_UpdateIsLast_AU"()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN
    
    v_cnt := 0;
	
	IF TG_OP = 'UPDATE' THEN
		IF EXISTS ( SELECT 1 FROM updated
						inner join "Frwk_ConfigurationItems" conf on conf."Id"=updated."Id"
						WHERE (updated."VersionNo" IS DISTINCT FROM conf."VersionNo") OR (updated."IsDeleted" IS DISTINCT FROM conf."IsDeleted")
					) THEN

			UPDATE "Frwk_ConfigurationItems" item
			SET "IsLast" = FALSE
			FROM updated  
			WHERE item."IsLast" = TRUE
				AND (updated."ModuleId" = item."ModuleId" OR (updated."ModuleId" IS NULL AND item."ModuleId" IS NULL))
				AND updated."Name" = item."Name"
				AND updated."ItemType" = item."ItemType"
				AND item."Id" <> (
					SELECT "Id"
					FROM "Frwk_ConfigurationItems" lastVersions
					WHERE lastVersions."IsDeleted" = FALSE
						AND (lastVersions."ModuleId" = item."ModuleId" OR (lastVersions."ModuleId" IS NULL AND item."ModuleId" IS NULL))
						AND lastVersions."Name" = item."Name"
						AND lastVersions."ItemType" = item."ItemType"
					ORDER BY lastVersions."VersionNo" DESC
					LIMIT 1
				); 

    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = false: %', (v_cnt);
    select count(1) into toupdate
	FROM "Frwk_ConfigurationItems" item
	inner JOIN updated ON (updated."ModuleId" = item."ModuleId" OR (updated."ModuleId" IS NULL AND item."ModuleId" IS NULL))
		AND updated."Name" = item."Name"
		AND updated."ItemType" = item."ItemType"
    WHERE item."IsLast" = false
        AND item."Id" = (
            SELECT "Id"
            FROM "Frwk_ConfigurationItems" lastVersions
            WHERE lastVersions."IsDeleted" = false
                AND (lastVersions."ModuleId" = item."ModuleId" OR (lastVersions."ModuleId" IS NULL AND item."ModuleId" IS NULL))
                AND lastVersions."Name" = item."Name"
                AND lastVersions."ItemType" = item."ItemType"
            ORDER BY lastVersions."VersionNo" DESC
            LIMIT 1
        );  
    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
			UPDATE "Frwk_ConfigurationItems" item
			SET "IsLast" = TRUE
			FROM updated  
			WHERE item."IsLast" = FALSE
				AND (updated."ModuleId" = item."ModuleId" OR (updated."ModuleId" IS NULL AND item."ModuleId" IS NULL))
				AND updated."Name" = item."Name"
				AND updated."ItemType" = item."ItemType"
				AND item."Id" = (
					SELECT "Id"
					FROM "Frwk_ConfigurationItems" lastVersions
					WHERE lastVersions."IsDeleted" = FALSE
						AND (lastVersions."ModuleId" = item."ModuleId" OR (lastVersions."ModuleId" IS NULL AND item."ModuleId" IS NULL))
						AND lastVersions."Name" = item."Name"
						AND lastVersions."ItemType" = item."ItemType"
					ORDER BY lastVersions."VersionNo" DESC
					LIMIT 1
			);
		
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
		END IF;
	END IF;

	RETURN NEW;
END;
$BODY$;
