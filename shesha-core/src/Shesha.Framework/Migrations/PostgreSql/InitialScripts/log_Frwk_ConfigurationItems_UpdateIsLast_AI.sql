CREATE OR REPLACE FUNCTION public."log_Frwk_ConfigurationItems_UpdateIsLast_AI"()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
declare
    v_cnt numeric;
    toupdate numeric;
BEGIN
    Raise notice 'Value: %', (select "ModuleId" from inserted);
    
    v_cnt := 0;
	
    UPDATE "Frwk_ConfigurationItems" item
    SET "IsLast" = false
    FROM inserted 
    WHERE 
        item."IsLast" = true
        AND (inserted."ModuleId" = item."ModuleId" OR (inserted."ModuleId" IS NULL AND item."ModuleId" IS NULL))
            AND inserted."Name" = item."Name"
            AND inserted."ItemType" = item."ItemType"
			AND item."Id" <> (
            SELECT "Id"
            FROM "Frwk_ConfigurationItems" lastVersions
            WHERE lastVersions."IsDeleted" = false
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
        inner JOIN inserted ON (inserted."ModuleId" = item."ModuleId" OR (inserted."ModuleId" IS NULL AND item."ModuleId" IS NULL))
            AND inserted."Name" = item."Name"
            AND inserted."ItemType" = item."ItemType"
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
    SET "IsLast" = true
    FROM inserted  
    WHERE item."IsLast" = false
        AND (inserted."ModuleId" = item."ModuleId" OR (inserted."ModuleId" IS NULL AND item."ModuleId" IS NULL))
            AND inserted."Name" = item."Name"
            AND inserted."ItemType" = item."ItemType"
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
		
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
    RETURN null;
END;
$BODY$;
