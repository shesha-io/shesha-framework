CREATE OR REPLACE FUNCTION public."log_Frwk_VersionedFieldVersions_UpdateIsLast_AD"()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
declare
    v_cnt numeric;
BEGIN

    v_cnt := 0;
	
	if exists (select 1 from deleted where "IsLast" = TRUE) then
	
		update "Frwk_VersionedFieldVersions" log
		set "IsLast" = TRUE 
		where
			(log."IsLast" = FALSE or log."IsLast" is null)
			and log."FieldId" = ANY (ARRAY(SELECT DISTINCT "FieldId" FROM deleted))
			and log."Id" = (
				select 
					"Id"
				from
					"Frwk_VersionedFieldVersions" log2
				where
					(log2."IsDeleted" = FALSE or log2."IsDeleted" is null)
					and log2."FieldId" = log."FieldId"
				order by log2."CreationTime" desc
				limit 1
			);

    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    Raise notice 'set IsLast = true: %', (v_cnt);
	end if;
	RETURN NULL;
END;
$BODY$;
