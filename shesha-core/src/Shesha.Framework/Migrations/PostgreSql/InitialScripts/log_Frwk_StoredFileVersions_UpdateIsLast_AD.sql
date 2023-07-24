CREATE OR REPLACE FUNCTION public."log_Frwk_StoredFileVersions_UpdateIsLast_AD"()
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
	
	IF (SELECT 1 FROM deleted WHERE "IsLast" = TRUE) IS NOT NULL THEN
		UPDATE "Frwk_StoredFileVersions" AS ver
		SET "IsLast" = TRUE
		FROM (
			SELECT DISTINCT "FileId"
			FROM deleted
		) AS del
		WHERE (ver."IsLast" = FALSE OR ver."IsLast" IS NULL)
			AND ver."FileId" = ANY (ARRAY(SELECT DISTINCT "FileId" FROM deleted))
			AND ver."Id" = (
				SELECT "Id"
				FROM "Frwk_StoredFileVersions" AS ver2
				WHERE ver2."FileId" = ver."FileId"
				ORDER BY ver2."CreationTime" DESC
				LIMIT 1
			);
			
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
	END IF;
	RETURN NULL;
END;
$BODY$;
