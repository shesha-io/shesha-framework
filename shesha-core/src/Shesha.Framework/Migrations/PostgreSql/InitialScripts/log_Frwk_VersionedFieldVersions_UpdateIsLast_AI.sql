CREATE OR REPLACE FUNCTION public."log_Frwk_VersionedFieldVersions_UpdateIsLast_AI"()
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
	
	update "Frwk_VersionedFieldVersions" log
	set "IsLast" = FALSE  
	where
		(log."IsLast" = TRUE or log."IsLast" is null)
		and log."FieldId" = ANY (ARRAY(SELECT DISTINCT "FieldId" FROM inserted))
		and log."Id" <> (
			select "Id"
			from "Frwk_VersionedFieldVersions" log2
			where (log2."IsDeleted" = FALSE or log2."IsDeleted" is null)
				and log2."FieldId" = log."FieldId"
			order by log2."CreationTime" desc
			limit 1
		);

	
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = false: %', (v_cnt);
    select count(1) into toupdate
	FROM "Frwk_VersionedFieldVersions" log
	where (log."IsLast" = TRUE or log."IsLast" is null)
		and log."FieldId" = ANY (ARRAY(SELECT DISTINCT "FieldId" FROM inserted))
		and log."Id" <> (
			select"Id"
			from "Frwk_VersionedFieldVersions" log2
			where (log2."IsDeleted" = FALSE or log2."IsDeleted" is null)
				and log2."FieldId" = log."FieldId"
			order by log2."CreationTime" desc
			limit 1
        );  
    Raise notice 'toupdate: %', (toupdate);
    v_cnt := 0;
	
	update "Frwk_VersionedFieldVersions" log
	set "IsLast" = TRUE 
	where (log."IsLast" = FALSE or log."IsLast" is null)
		and log."FieldId" = ANY (ARRAY(SELECT DISTINCT "FieldId" FROM inserted))
		and log."Id" = (
			select 
				"Id"
			from "Frwk_VersionedFieldVersions" log2
			where (log2."IsDeleted" = FALSE or log2."IsDeleted" is null)
				and log2."FieldId" = log."FieldId"
			order by log2."CreationTime" desc
			limit 1
		);
		
    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	
	RETURN NEW;
END;
$BODY$;
