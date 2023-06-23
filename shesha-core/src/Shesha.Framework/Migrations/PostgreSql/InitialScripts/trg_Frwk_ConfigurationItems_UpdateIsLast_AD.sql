CREATE TRIGGER "trg_Frwk_ConfigurationItems_UpdateIsLast_AD"
    AFTER DELETE
    ON public."Frwk_ConfigurationItems"
    REFERENCING OLD TABLE AS deleted
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_ConfigurationItems_UpdateIsLast_AD"();