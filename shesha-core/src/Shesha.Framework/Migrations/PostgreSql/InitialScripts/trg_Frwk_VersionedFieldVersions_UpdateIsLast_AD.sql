CREATE TRIGGER "trg_Frwk_VersionedFieldVersions_UpdateIsLast_AD"
    AFTER DELETE
    ON public."Frwk_VersionedFieldVersions"
    REFERENCING OLD TABLE AS deleted
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_VersionedFieldVersions_UpdateIsLast_AD"();