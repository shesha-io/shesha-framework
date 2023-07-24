CREATE TRIGGER "trg_Frwk_ConfigurationItems_UpdateIsLast_AU"
    AFTER UPDATE 
    ON public."Frwk_ConfigurationItems"
    REFERENCING OLD TABLE AS updated
    FOR EACH STATEMENT
    EXECUTE FUNCTION public."log_Frwk_ConfigurationItems_UpdateIsLast_AU"();