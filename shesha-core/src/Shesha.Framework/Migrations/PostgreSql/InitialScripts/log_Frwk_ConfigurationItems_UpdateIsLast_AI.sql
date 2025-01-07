CREATE OR REPLACE FUNCTION public."log_Frwk_ConfigurationItems_UpdateIsLast_AI"()
RETURNS trigger
LANGUAGE 'plpgsql'
COST 100
VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
    v_cnt numeric;
    toupdate numeric;
    rec RECORD; -- Variable to iterate over rows in inserted
BEGIN
    -- Iterate through each row in 'inserted'
    FOR rec IN SELECT * FROM inserted LOOP
        RAISE NOTICE 'Processing ModuleId: %, Name: %, ItemType: %', rec."ModuleId", rec."Name", rec."ItemType";
        
        -- Reset IsLast = false
        UPDATE "Frwk_ConfigurationItems" item
        SET "IsLast" = false
        WHERE item."IsLast" = true
          AND (rec."ModuleId" = item."ModuleId" OR (rec."ModuleId" IS NULL AND item."ModuleId" IS NULL))
          AND rec."Name" = item."Name"
          AND rec."ItemType" = item."ItemType"
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
        RAISE NOTICE 'Set IsLast = false for % rows', v_cnt;

        -- Count rows to update
        SELECT count(1) INTO toupdate
        FROM "Frwk_ConfigurationItems" item
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

        RAISE NOTICE 'Rows to update: %', toupdate;

        -- Reset IsLast = true
        UPDATE "Frwk_ConfigurationItems" item
        SET "IsLast" = true
        WHERE item."IsLast" = false
          AND (rec."ModuleId" = item."ModuleId" OR (rec."ModuleId" IS NULL AND item."ModuleId" IS NULL))
          AND rec."Name" = item."Name"
          AND rec."ItemType" = item."ItemType"
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
        RAISE NOTICE 'Set IsLast = true for % rows', v_cnt;
    END LOOP;

    RETURN NULL;
END;
$BODY$;
