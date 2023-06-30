CREATE TRIGGER "trg_Frwk_StoredFileVersions_UpdateIsLast_AI"
    AFTER INSERT
    ON public."Frwk_StoredFileVersions"
    REFERENCING NEW TABLE AS inserted
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_StoredFileVersions_UpdateIsLast_AI"();