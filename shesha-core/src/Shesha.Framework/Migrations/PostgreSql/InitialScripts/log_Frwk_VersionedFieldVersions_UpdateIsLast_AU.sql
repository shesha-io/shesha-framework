CREATE OR REPLACE FUNCTION public."log_Frwk_VersionedFieldVersions_UpdateIsLast_AU"()
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
	
    IF (TG_OP = 'UPDATE') THEN
		 IF EXISTS ( SELECT 1 FROM updated
						inner join "Frwk_VersionedFieldVersions" conf on conf."Id"=updated."Id"
						WHERE (updated."CreationTime" IS DISTINCT FROM conf."CreationTime") OR (updated."IsDeleted" IS DISTINCT FROM conf."IsDeleted")
					) THEN
			update "Frwk_VersionedFieldVersions" log
			set "IsLast" = false  
			where (log."IsLast" = true or log."IsLast" is null)
				and log."FieldId" = ANY (ARRAY(SELECT DISTINCT "FieldId" FROM updated))
				and log."Id" <> (
					select "Id"
					from "Frwk_VersionedFieldVersions" log2
					where (log2."IsDeleted" = false or log2."IsDeleted" is null)
						and log2."FieldId" = log."FieldId"
					order by log2."CreationTime" desc
					limit 1
				);

	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = false: %', (v_cnt);
    select count(1) into toupdate
	FROM "Frwk_VersionedFieldVersions" log
			where (log."IsLast" = true or log."IsLast" is null)
				and log."FieldId" = ANY (ARRAY(SELECT DISTINCT "FieldId" FROM updated))
				and log."Id" <> (
					select "Id"
					from "Frwk_VersionedFieldVersions" log2
					where (log2."IsDeleted" = false or log2."IsDeleted" is null)
						and log2."FieldId" = log."FieldId"
					order by log2."CreationTime" desc
					limit 1
        );  
    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
			update "Frwk_VersionedFieldVersions" log
			set "IsLast" = true  
			where
				(log."IsLast" = false or log."IsLast" is null)
				and log."FieldId" = ANY (ARRAY(SELECT DISTINCT "FieldId" FROM updated))
				and log."Id" = (
					select "Id"
					from "Frwk_VersionedFieldVersions" log2
					where (log2."IsDeleted" = false or log2."IsDeleted" is null)
						and log2."FieldId" = log."FieldId"
					order by log2."CreationTime" desc
					limit 1
				);
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
		end if;
	end if;
	RETURN NULL;
END;
$BODY$;
