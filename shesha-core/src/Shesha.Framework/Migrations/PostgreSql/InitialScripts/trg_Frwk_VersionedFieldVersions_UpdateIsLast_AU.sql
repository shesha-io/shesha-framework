CREATE TRIGGER "trg_Frwk_VersionedFieldVersions_UpdateIsLast_AU"
    AFTER UPDATE 
    ON public."Frwk_VersionedFieldVersions"
    REFERENCING OLD TABLE AS updated
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_VersionedFieldVersions_UpdateIsLast_AU"();