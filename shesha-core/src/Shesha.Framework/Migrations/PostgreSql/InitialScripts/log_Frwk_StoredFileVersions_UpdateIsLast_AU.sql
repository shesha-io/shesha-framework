CREATE OR REPLACE FUNCTION public."log_Frwk_StoredFileVersions_UpdateIsLast_AU"()
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
	
	IF TG_OP = 'UPDATE'  THEN
		 IF EXISTS ( SELECT 1 FROM updated
						inner join "Frwk_StoredFileVersions" conf on conf."Id"=updated."Id"
						WHERE (updated."CreationTime" IS DISTINCT FROM conf."CreationTime")
					) THEN

			UPDATE "Frwk_StoredFileVersions" AS ver
			SET "IsLast" = FALSE
			WHERE (ver."IsLast" = TRUE OR ver."IsLast" IS NULL)
				AND ver."FileId" = ANY (ARRAY(SELECT DISTINCT "FileId" FROM updated))
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
				AND ver."FileId" = ANY (ARRAY(SELECT DISTINCT "FileId" FROM updated))
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
				AND ver."FileId" = ANY (ARRAY(SELECT DISTINCT "FileId" FROM updated))
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
	END IF;

	RETURN NEW;
END;
$BODY$;
