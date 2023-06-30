CREATE TRIGGER "trg_Frwk_StoredFileVersions_UpdateIsLast_AD"
    AFTER DELETE
    ON public."Frwk_StoredFileVersions"
    REFERENCING OLD TABLE AS deleted
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_StoredFileVersions_UpdateIsLast_AD"();