CREATE TRIGGER "trg_Frwk_ConfigurationItems_UpdateIsLast_AI"
    AFTER INSERT
    ON public."Frwk_ConfigurationItems"
    REFERENCING NEW TABLE AS inserted
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_ConfigurationItems_UpdateIsLast_AI"();