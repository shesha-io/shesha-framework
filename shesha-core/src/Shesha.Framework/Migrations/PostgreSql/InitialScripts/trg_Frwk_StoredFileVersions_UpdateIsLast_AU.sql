CREATE TRIGGER "trg_Frwk_StoredFileVersions_UpdateIsLast_AU"
    AFTER UPDATE 
    ON public."Frwk_StoredFileVersions"
    REFERENCING OLD TABLE AS updated
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_StoredFileVersions_UpdateIsLast_AU"();