CREATE TRIGGER "trg_Frwk_VersionedFieldVersions_UpdateIsLast_AI"
    AFTER INSERT
    ON public."Frwk_VersionedFieldVersions"
    REFERENCING NEW TABLE AS inserted
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_VersionedFieldVersions_UpdateIsLast_AI"();