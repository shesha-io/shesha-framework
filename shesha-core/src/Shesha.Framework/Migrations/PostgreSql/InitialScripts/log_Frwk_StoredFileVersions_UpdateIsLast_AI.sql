CREATE OR REPLACE FUNCTION public."log_Frwk_StoredFileVersions_UpdateIsLast_AI"()
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
	
	UPDATE "Frwk_StoredFileVersions" AS ver
	SET "IsLast" = FALSE
	WHERE (ver."IsLast" = TRUE OR ver."IsLast" IS NULL)
		AND ver."FileId" = ANY (ARRAY(SELECT DISTINCT "FileId" FROM inserted))
		AND ver."Id" <> (
			SELECT "Id"
			FROM "Frwk_StoredFileVersions" AS ver2
			WHERE ver2."FileId" = ver."FileId"
			ORDER BY ver2."CreationTime" DESC
			LIMIT 1
		);

	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = false: %', (v_cnt);
    select count(1) into toupdate
	FROM "Frwk_StoredFileVersions" AS ver
    WHERE (ver."IsLast" = TRUE OR ver."IsLast" IS NULL)
		AND ver."FileId" = ANY (ARRAY(SELECT DISTINCT "FileId" FROM inserted))
		AND ver."Id" <> (
			SELECT "Id"
			FROM "Frwk_StoredFileVersions" AS ver2
			WHERE ver2."FileId" = ver."FileId"
			ORDER BY ver2."CreationTime" DESC
			LIMIT 1
        );  
    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
	UPDATE "Frwk_StoredFileVersions" AS ver
	SET "IsLast" = TRUE
	WHERE (ver."IsLast" = FALSE OR ver."IsLast" IS NULL)
		AND ver."FileId" = ANY (ARRAY(SELECT DISTINCT "FileId" FROM inserted))
		AND ver."Id" = (
			SELECT "Id"
			FROM "Frwk_StoredFileVersions" AS ver2
			WHERE ver2."FileId" = ver."FileId"
			ORDER BY ver2."CreationTime" DESC
			LIMIT 1
		);
		
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
	RETURN NULL;
END;
$BODY$;
